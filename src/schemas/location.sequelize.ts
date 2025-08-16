import {
  Sequelize,
  ModelCtor,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
  DataTypes,
  NonAttribute,
} from "npm:sequelize";
import type { Point } from "npm:geojson";
import { LocationGeoJSONProperties, LocationType } from "../types/index.ts";

export interface LocationModel
  extends Model<
    InferAttributes<LocationModel>,
    InferCreationAttributes<LocationModel>
  > {
  id: CreationOptional<number>;
  svr_id: number;
  created_at: CreationOptional<Date | string>;
  name: string;
  code: string;
  category: LocationType;
  area_name: string;
  geojson: Point;
  created_by: string;
  updated_at: CreationOptional<Date | string>;
  distance: NonAttribute<number>;
  updated_by: CreationOptional<string>;
  properties: CreationOptional<LocationGeoJSONProperties>;
}

export type LocationInstance = ModelCtor<LocationModel>;

export const createLocationModel = (sequelize: Sequelize) => {
  return <LocationInstance>sequelize.define<
    LocationModel,
    InferCreationAttributes<LocationModel>
  >(
    "Locations",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
      },
      svr_id: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(400),
        allowNull: false,
      },
      area_name: {
        type: DataTypes.STRING(400),
        allowNull: false,
      },
      geojson: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: "General",
      },
      created_by: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      updated_by: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
    },
    {
      tableName: "locations",
    },
  );
};
