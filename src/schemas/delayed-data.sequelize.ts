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

export interface DelayedDataModel
  extends Model<
    InferAttributes<DelayedDataModel>,
    InferCreationAttributes<DelayedDataModel>
  > {
  id: CreationOptional<number>;
  lat: CreationOptional<number>;
  lon: CreationOptional<number>;
  alt: CreationOptional<number>;
  time: CreationOptional<string>;
  speed: CreationOptional<number>;
  track: CreationOptional<number>;
  fix: CreationOptional<"3D" | "2D" | null>;
  pdop: CreationOptional<number>;
  vdop: CreationOptional<number>;
  hdop: CreationOptional<number | null>;
  ip_address: CreationOptional<string | null>;
  mac_address: CreationOptional<string | null>;
  is_synced: CreationOptional<boolean>;
  createdAt: NonAttribute<string>;
  updatedAt: NonAttribute<string>;
}

export type DelayedDataInstance = ModelCtor<DelayedDataModel>;

export const createDelayedDataModel = (sequelize: Sequelize) => {
  return <DelayedDataInstance>sequelize.define<
    DelayedDataModel,
    InferCreationAttributes<DelayedDataModel>
  >(
    "DelayedData",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      is_synced: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      lon: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      alt: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      time: DataTypes.DATE,
      fix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      hdop: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      pdop: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      speed: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      track: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      vdop: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      mac_address: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
    },
    {
      tableName: "delayed-data",
    },
  );
};
