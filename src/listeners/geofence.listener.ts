import * as turf from "@turf/turf";
import { Application, Router } from "../app.ts";
import { gridlockEvents, internalEvents } from "../consts/index.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";
import { EventListener } from "../listener.ts";
import { SessionModel } from "../schemas/session.sequelize.ts";
import { StateType } from "../lib/gps/gps.ts";
import { LocationModel } from "../schemas/location.sequelize.ts";
import { InferAttributes, Op } from "sequelize";
import { EventUpdateData } from "../handlers/socket.handler.ts";
import type {
  CycleSettingAttributes,
  CycleSettingItem,
  LocationTrigger,
} from "../types/index.ts";
import { Feature } from "geojson";
import { Point } from "geojson";
import { GeoJsonProperties } from "geojson";

type SessionEventData = {
  session: InferAttributes<SessionModel, { omit?: never }>;
  token: string;
  equipment_uuid: string;
};

type CalculateGeofenceArgs = {
  condition: LocationTrigger["condition"];
  currentPosition: Feature<Point, GeoJsonProperties>;
  location: Feature<Point, GeoJsonProperties>;
  radius: number;
};

export class GeoFenceListener extends EventListener {
  name = "geofence-listener";
  private _session: SessionEventData | null = null;
  private _models: ModelInstances;
  private _locations: Array<LocationModel> = [];
  private cycleSettings: CycleSettingAttributes["items"] = [];
  private loadingLoc: LocationModel | null = null;
  private dumpingLoc: LocationModel | null = null;
  private _emitted: boolean = false;
  private _lastUpdated: number = 0;
  private router = new Router();

  constructor() {
    super();
    this._models = new LocalModels({
      sync: false,
      alter: false,
      logging: false,
    }).models;
    this._lastUpdated = Date.now();
  }

  public override init(app: Application): void {
    const event = app.emitter;
    const cycleSettings = app.get("cycle-settings") as CycleSettingAttributes;
    // console.log("test", cycleSettings);
    this.cycleSettings = cycleSettings.items;
    event.on(internalEvents.GEOFENCE_START, async (data: SessionEventData) => {
      this._session = data;
      const locations = await this._models.Location.findAll({
        where: {
          svr_id: {
            [Op.in]:
              data.session.equipment_type === "Truck"
                ? [
                    data.session.loading_location_id,
                    data.session.dumping_location_id!,
                  ]
                : [data.session.loading_location_id],
          },
        },
      });

      this._locations = locations;

      const loadingLocation = this._locations.find(
        (loc) => loc.category === "Loading Site",
      )!;
      this.loadingLoc = loadingLocation;

      if (this._locations.length < 2) return;

      const dumpingLocation = this._locations.find(
        (loc) => loc.category === "Dumping Site",
      )!;
      this.dumpingLoc = dumpingLocation;
    });

    event.emit(internalEvents.EVENT_UPDATE, (data: EventUpdateData) => {
      if (this._session === null) return;
      const { session } = this._session;
      this._session = {
        ...this._session,
        session: {
          ...session,
          event_id: data.currentEventId,
          event_description: data.currentEventDescription,
          event_status: data.currentEventStatus,
          event_code: data.currentEventCode,
          previous_event_id: this._session.session.event_id,
        },
      };
      this._lastUpdated = Date.now();
      this._emitted = false;
    });

    this.router.get("/api/geofence", (ctx) => {
      ctx.response.body = {
        loading_location: this.loadingLoc ?? {},
        dumping_location: this.dumpingLoc ?? {},
        last_updated: this._lastUpdated,
      };
    });

    app.httpUse(this.router.routes());

    app.ioUse((io) => {
      io.on("connection", (socket) => {
        event.on(internalEvents.GPS_DATA, (gps: StateType) => {
          if (typeof gps.GGA === "undefined" || gps.GGA === null) return;
          if (this._session === null) return;
          if (this._session.session.equipment_type !== "Truck") return;
          const currentCoords = turf.point([gps.GGA.lon, gps.GGA?.lat]);

          const nextEventTrigger = this.getNextCycleEventTriggers();
          if (typeof nextEventTrigger === "undefined") return;
          const trigger = this.getEventGPSTrigger(nextEventTrigger);
          if (typeof trigger === "undefined") return;
          const radius = this.getRadiusFromProperties(trigger);
          if (radius === null) return;
          if (
            ["Loading Site", "Dumping Site"].includes(trigger.location_type)
          ) {
            if (this.loadingLoc === null) return;
            if (this.dumpingLoc === null) return;

            const locationCoords = turf.point(
              (trigger.location_type === "Loading Site"
                ? this.loadingLoc
                : this.dumpingLoc
              ).geojson.coordinates,
            );

            const result = this.calculateGeofence({
              condition: trigger.condition,
              location: locationCoords,
              radius,
              currentPosition: currentCoords,
            });
            const canContinue = this.canContinue();
            if (result.inside && !this._emitted && canContinue) {
              this._emitted = true;
              socket.emit(gridlockEvents.NEXT_EVENT, { condition: "next" });
            }
          }

          // const geofenceRule =
        });
      });
    });
  }

  private canContinue() {
    const diff = Date.now() - this._lastUpdated;
    return diff < 30000;
  }

  private calculateGeofence({
    condition,
    radius,
    location,
    currentPosition,
  }: CalculateGeofenceArgs) {
    const distance = turf.distance(location, currentPosition, {
      units: "meters",
    });

    if (condition === "in") {
      return {
        inside: distance < radius,
        distance,
      };
    } else {
      return {
        inside: distance > radius,
        distance,
      };
    }
  }

  private getRadiusFromProperties(
    // locationType: LocationType,
    trigger: LocationTrigger,
  ) {
    const locationType = trigger.location_type;
    if (this._session === null) return null;
    if (locationType === "Loading Site" && this.loadingLoc === null)
      return null;
    if (locationType === "Dumping Site" && this.dumpingLoc === null)
      return null;

    switch (locationType) {
      case "Loading Site": {
        return this.loadingLoc?.properties[trigger.selected_radius] as number;
      }
      case "Dumping Site": {
        return this.dumpingLoc?.properties[trigger.selected_radius] as number;
      }
      case "Geo Fence":
        return null;
      case "Line":
        return null;
      case "General":
        return null;
      default:
        return null;
    }
  }

  private getEventGPSTrigger(setting: CycleSettingItem) {
    const trigger = setting.triggers.find(
      (trigger) => trigger.type === "location",
    );
    return trigger;
  }

  private getNextCycleEventTriggers() {
    if (this._session === null) return;
    const currentEventIndex = this.getCycleEventIndex(
      this._session.session.event_code,
    );
    if (currentEventIndex < 0) return;
    const nextEvent = this.getNextCycleEvent(currentEventIndex);
    return nextEvent;
  }

  getRadius() {
    if (this.cycleSettings.length === 0) return;
    if (this.loadingLoc === null) return;
  }

  private getNextCycleEvent(index: number) {
    if (this._session === null) return;
    const { session } = this._session;

    if (!this.isCycleEvent(session.event_code)) return;
    const eventIndex = this.getCycleEventIndex(session.event_code);
    if (eventIndex < 0) return;
    const newIndex = (index + 1) % this.cycleSettings.length;

    return this.cycleSettings[newIndex];
  }

  private getCycleEventIndex(eventCode: string) {
    return this.cycleSettings.findIndex(
      (setting) => setting.parsed_metadata.code === eventCode,
    );
  }

  private isCycleEvent(eventCode: string) {
    return this.cycleSettings.some(
      (setting) => setting.parsed_metadata.code === eventCode,
    );
  }

  public override unregister(): void {
    console.log("unregister");
  }
}
