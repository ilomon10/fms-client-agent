import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelCtor,
  NOW,
  Sequelize,
} from "sequelize";
import { EquipmentTypes } from "../types/index.ts";

export interface SessionModel
  extends Model<
    InferAttributes<SessionModel>,
    InferCreationAttributes<SessionModel>
  > {
  id: CreationOptional<number>;
  /**
   * session's server id
   */
  svr_id: CreationOptional<number>;
  excavator_id: CreationOptional<number | null>;
  equipment_id: number;
  event_id: CreationOptional<number>;
  event_description: CreationOptional<string>;
  event_status: CreationOptional<string>;
  event_code: CreationOptional<string>;
  loading_location_id: CreationOptional<number>;
  dumping_location_id: CreationOptional<number | null>;
  material_id: CreationOptional<number>;
  operator_id: number;
  previous_event_id: CreationOptional<number | null>;
  excavator_hull_number: CreationOptional<string | null>;
  equipment_hull_number: CreationOptional<string | null>;
  equipment_type: CreationOptional<EquipmentTypes>;
  shift: CreationOptional<string>;
  job_type: CreationOptional<string>;
  is_active: CreationOptional<boolean>;
  createdAt: CreationOptional<string>;
}

export type SessionIntance = ModelCtor<SessionModel>;

export const createSessionModel = (sequelize: Sequelize) => {
  return sequelize.define<SessionModel, InferCreationAttributes<SessionModel>>(
    "Sesssion",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      svr_id: DataTypes.INTEGER,
      event_id: DataTypes.INTEGER,
      event_code: {
        type: DataTypes.STRING(400),
      },
      event_description: {
        type: DataTypes.STRING(500),
      },
      event_status: DataTypes.STRING(500),
      material_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      operator_id: DataTypes.INTEGER,
      equipment_id: DataTypes.INTEGER,
      equipment_hull_number: DataTypes.STRING(500),
      excavator_hull_number: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      excavator_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      equipment_type: DataTypes.STRING(500),
      shift: DataTypes.STRING(200),
      job_type: DataTypes.STRING(300),
      loading_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dumping_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      previous_event_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: NOW,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },

    {
      tableName: "sessions",
    },
  );
};
