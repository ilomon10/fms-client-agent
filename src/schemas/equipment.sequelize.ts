import {
  Sequelize,
  ModelCtor,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
  DataTypes,
} from "npm:sequelize";
import { EquipmentTypes } from "../types/index.ts";

export interface EquipmentModel
  extends Model<
    InferAttributes<EquipmentModel>,
    InferCreationAttributes<EquipmentModel>
  > {
  id: CreationOptional<number>;
  svr_id: number;
  asset_name: string;
  hull_number: string;
  category: EquipmentTypes | null;
  subcategory: string;
  class: CreationOptional<string>;
  oracle_number: string;
  uuid: string;
  project: CreationOptional<string>;
  model: CreationOptional<string | null>;
  default_act: CreationOptional<string | null>;
  ext_id: CreationOptional<string | null>;
  hour_meter: CreationOptional<number>;
  truck_factor: number;
  fuel_capacity: number;
  ownership_type: CreationOptional<string>;
  tonnage: number;
  commdate: CreationOptional<string | null>;
  status: CreationOptional<"Ready" | "Breakdown">;
  tonnes_per_hour: number;
}

export type EquipmentInstance = ModelCtor<EquipmentModel>;

export const createEquipmentModel = (
  sequelize: Sequelize,
): EquipmentInstance => {
  return <EquipmentInstance>sequelize.define<
    EquipmentModel,
    InferCreationAttributes<EquipmentModel>
  >(
    "Equipments",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      svr_id: {
        type: DataTypes.INTEGER,
      },
      asset_name: {
        type: DataTypes.STRING(400),
        allowNull: false,
      },
      hull_number: {
        type: DataTypes.STRING(400),
        allowNull: false,
      },
      tonnage: DataTypes.INTEGER,
      oracle_number: DataTypes.STRING(300),
      class: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      uuid: DataTypes.STRING(500),
      status: DataTypes.STRING(400),
      truck_factor: DataTypes.INTEGER,
      project: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      ownership_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      hour_meter: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true },
      model: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      fuel_capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ext_id: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      default_act: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      commdate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      subcategory: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "-",
        validate: {},
      },
      category: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: "-",
      },
      tonnes_per_hour: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      tableName: "equipment",
    },
  );
};
