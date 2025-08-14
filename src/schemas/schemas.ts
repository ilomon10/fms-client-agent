import { ColumnType } from "../lib/db/db.ts";
import { EquipmentAttributes } from "../types/index.ts";

export const equipmentDBSchema: Record<
  keyof Omit<
    EquipmentAttributes,
    | "id"
    | "created_at"
    | "updated_at"
    | "created_by"
    | "updated_by"
    | "deleted_at"
  >,
  ColumnType
> = {
  asset_name: "TEXT",
  hull_number: "TEXT",
  serial_number: "TEXT",
  category: "TEXT",
  subcategory: "TEXT",
  tonnage: "INT",
  class: "TEXT",
  commdate: "DATETIME",
  uuid: "TEXT",
  default_act: "TEXT",
  ext_id: "TEXT",
  model: "TEXT",
  extra_props: "TEXT",
  fuel_capacity: "REAL",
  hour_meter: "REAL",
  name: "TEXT",
  oracle_number: "TEXT",
  ownership_type: "TEXT",
  project: "TEXT",
  status: "TEXT",
  truck_factor: "REAL",
};
