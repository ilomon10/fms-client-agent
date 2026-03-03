import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelCtor,
  Sequelize,
} from "sequelize";

export interface EventModel
  extends Model<
    InferAttributes<EventModel>,
    InferCreationAttributes<EventModel>
  > {
  id: CreationOptional<number>;
  svr_id: CreationOptional<number>;
  status: string;
  type: string;
  code: string;
  description: string;
  attributes: Record<string, string | number | boolean>;
  description_ind: string;
}

export type EventInstance = ModelCtor<EventModel>;

export const createEventModel = (sequelize: Sequelize) => {
  return sequelize.define<EventModel, InferCreationAttributes<EventModel>>(
    "Event",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      svr_id: DataTypes.INTEGER,
      status: DataTypes.STRING(500),
      type: DataTypes.STRING(500),
      code: DataTypes.STRING(500),
      description: DataTypes.TEXT,
      attributes: DataTypes.JSON,
      description_ind: DataTypes.TEXT,
    },
    {
      name: {
        singular: "event",
        plural: "events",
      },
      tableName: "events",
    },
  );
};
