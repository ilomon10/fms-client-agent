import {
  ModelCtor,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  DataTypes,
} from "sequelize";
import { TempEventLogAttributes } from "../types/index.ts";

export interface EventLogModel
  extends Model<
    InferAttributes<EventLogModel>,
    InferCreationAttributes<EventLogModel>
  > {
  id: CreationOptional<number>;
  description: string;
  description_ind: string;
  code: string;
  type: string;
  status: string;
  timestamp: string;
  hourMeter: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  updated_by: string;
  latitude: number;
  longitude: number;
  is_logged_out: boolean;
  session_id: number;
  overridenFromServer: boolean;
  isSynced: boolean;
  sessionId: number;
  validForSync: boolean;
  _id: string;
  attributes: CreationOptional<TempEventLogAttributes>;
}

export type EventLogInstance = ModelCtor<EventLogModel>;

export const createEventLogModel = (sequelize: Sequelize): EventLogInstance => {
  return sequelize.define<
    EventLogModel,
    InferCreationAttributes<EventLogModel>
  >(
    "EventLog",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      description: DataTypes.STRING(400),
      description_ind: DataTypes.STRING(400),
      code: DataTypes.STRING(300),
      type: DataTypes.STRING(300),
      status: DataTypes.STRING(300),
      created_by: DataTypes.STRING(600),
      created_at: DataTypes.STRING(600),
      updated_at: DataTypes.STRING(600),
      _id: {
        type: DataTypes.TEXT,
        field: "uuid",
      },
      attributes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      hourMeter: DataTypes.DOUBLE,
      is_logged_out: DataTypes.BOOLEAN,
      isSynced: DataTypes.BOOLEAN,
      latitude: DataTypes.DOUBLE,
      longitude: DataTypes.DOUBLE,
      overridenFromServer: DataTypes.BOOLEAN,
      session_id: DataTypes.INTEGER,
      sessionId: DataTypes.INTEGER,
      timestamp: DataTypes.DATE,
      updated_by: DataTypes.TEXT,
      validForSync: DataTypes.BOOLEAN,
    },
    {
      name: {
        plural: "event-logs",
        singular: "event-log",
      },
      modelName: "EventLog",
      tableName: "event-logs",
    },
  );
};
