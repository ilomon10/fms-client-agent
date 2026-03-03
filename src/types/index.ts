import type { GeoJSONProperties, Geometry } from "geojson";
import { UserType, UserPermission } from "../schemas/operator.sequelize.ts";

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

export type LocationTrigger = {
  type: "location";
  selected_radius: string;
  condition: "in" | "out";
  location_type: LocationType;
};

export type OverrideTrigger = {
  type: "override";
};

export type ClickTrigger = {
  type: "click";
};

export type EventCycleTrigger =
  | "arrived_at_load"
  | "start_loading"
  | "finish_loading"
  | "hauling"
  | "arrived_at_dump"
  | "start_dumping"
  | "finish_dumping"
  | "travelling";
export type CycleTrigger = {
  start: EventCycleTrigger;
  end: EventCycleTrigger;
};

export type EventTrigger = LocationTrigger | ClickTrigger | OverrideTrigger;

export type CycleSettingAttributes = BaseAttributes & {
  name: string;
  items: Array<CycleSettingItem>;
  default: boolean;
  equipment_type: EquipmentTypes;
};

export type CycleSettingItem = {
  event_id: number;
  /**
   * It is a base64 of a stringified JSON that contains an event information
   */
  _metadata: string;
  triggers: Array<EventTrigger>;
  cycle_trigger: CycleTrigger;
  parsed_metadata: EventAttributes;
};

export type EventAttributes = BaseAttributes & {
  status: string;
  type: string;
  code: string;
  description: string;
  attributes: Record<string, string | number | boolean>;
  description_ind: string;
};

export type ShiftDetail = {
  start: string;
  end: string;
  label: string;
};

export type SiteSettings = {
  name: string;
  code: string;
  orgCode: string;
  shifts: ShiftDetail[];
};

export type SessionAttributes = BaseAttributes & {
  operator_id: number;
  foreman_id: number;
  event_status: string;
  latitude: number;
  longitude: number;
  speed: number;
  bearing: number;
  equipment_id: number;
  loading_location_id: number;
  dumping_location_id: number;
  event_id: number;
  schedule_id: number;
  material_id: number;
  exca_id: number;
  start_hour_meter: number;
  end_hour_meter: number;
  done_at: string | null;
  done_reason: string | null;
  equipment_type: EquipmentTypes;
  block_id: number;
  Equipment?: EquipmentAttributes;
  Excavator?: EquipmentAttributes;
  event?: EventAttributes;
  loading_location?: LocationAttributes;
  dumping_location?: LocationAttributes;
  event_code: string;
  previous_event_id: number | null;
  operator_name: string | null;
  operator_oracle_number: string | null;
  equipment_hull_number: string | null;
  equipment_asset_name: string | null;
  loading_location_name: string | null;
  loading_location_code: string | null;
  dumping_location_name: string | null;
  dumping_location_code: string | null;
  event_description: string;
  cycle_count: number;
  shift: string;
  shift_date: string;
  mine_plan_id: number | null;
  material_name: string | null;
  job_type: string;
  material_code: string | null;
  exca_hull_number: string | null;
  exca_asset_name: string | null;
  block_code: string | null;
  block_request_level: number | null;
  foreman_oracle_number: string | null;
  exca_session_id: number | null;
};

export type OperatorAttributes = {
  id: number;
  name: string;
  username: string;
  password: string;
  oracle_number: string;
  last_login: string;
  employee_id: number;
  type: UserType;
  permission_json: UserPermission;
  position: string;
  department: string;
};

export type EquipmentSetting = { id: number; uuid: string };

export interface TempEventLogAttributes {
  results?: Array<PrestartResult>;
}

export interface PrestartResult {
  id: number;
  check: string;
  description: string;
  condition: boolean;
  category: "A" | "B" | "C";
}
