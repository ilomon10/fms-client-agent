import { GeoJSONProperties, Geometry } from "npm:geojson";

export type OkResponse<T> = {
  data: T;
  elapsedTime: number;
  status: boolean;
};

export type BaseAttributes = {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  updated_by: string;
};

export type EquipmentTypes =
  | "Truck"
  | "Excavator"
  | "Light Vehicle"
  | "Dozer"
  | "Grader"
  | "Compactor";

export type EquipmentAttributes = {
  name: string;
  category: EquipmentTypes;
  class: string;
  commdate: string;
  default_act: string | null;
  ext_id: string | null;
  extra_props: null | Record<string, number | string | boolean>;
  model: string;
  oracle_number: string;
  project: string;
  serial_number: string;
  subcategory: string;
  tonnage: number;
  status: "Breakdown" | "Ready";
  uuid: string;
  asset_name: string;
  hull_number: string;
  hour_meter: number;
  fuel_capacity: number;
  ownership_type: "Non-SMA" | "SMA";
  truck_factor: number;
  tonnes_per_hour: number;
} & BaseAttributes;

export type LocationType =
  | "Loading Site"
  | "Dumping Site"
  | "Geo Fence"
  | "Line"
  | "General";

export type LocationGeoJSONProperties = {
  waiting_radius: number;
  spotting_radius: number;
  departure_radius: number;
  loading_radius: number;
  disposal_radius: number;
  dumping_departure_radius: number;
  tipping_radius: number;
  name?: string;
  category?: LocationType;
  id?: number;
  area_name?: string;
  code?: string;
} & GeoJSONProperties;

export type LocationAttributes = {
  name: string;
  code: string;
  area_name: string;
  geojson: Geometry;
  category: LocationType;
  properties: LocationGeoJSONProperties;
} & BaseAttributes;
