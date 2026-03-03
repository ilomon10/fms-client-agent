import { RouterContext } from "oak";
import * as turf from "@turf/turf";
import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";
import { errorResponse } from "../helpers/errors.ts";
import { LocationModel } from "../schemas/location.sequelize.ts";

export class LocationFeature extends Feature {
  name = "location.feature";
  public override status: FeatureStatus;
  private models: ModelInstances = new LocalModels({ sync: false }).models;

  constructor() {
    super();
    this.status = "OK";
  }

  public override register(app: Application): void | Promise<void> {
    const router = new Router();

    router.get("/api/locations", this.findLocations);

    app.httpUse(router.routes());
  }

  private findLocations = async (ctx: RouterContext<"/api/locations">) => {
    try {
      const { searchParams } = ctx.request.url;
      const type = searchParams.get("type");
      const locations = await this.models.Location.findAndCountAll();
      this.status = "OK";
      if (type === "feature-collection") {
        ctx.response.status = 200;
        ctx.response.body =
          this.transformLocationsToFeatureCollection(locations);

        return;
      }
      ctx.response.status = 200;
      ctx.response.body = {
        data: locations,
        type,
      };
    } catch (error) {
      this.status = "FAIL";
      ctx.response.status = 500;
      ctx.response.body = errorResponse(error);
    }
  };

  private transformLocationsToFeatureCollection(locations: {
    rows: LocationModel[];
    count: number;
  }) {
    return turf.featureCollection(
      locations.rows.map((location) =>
        turf.feature(location.geojson, {
          ...location.properties,
          location_id: location.svr_id,
          category: location.category,
          location_name: location.name,
          location_code: location.code,
        }),
      ),
    );
  }
}
