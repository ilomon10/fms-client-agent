import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelCtor,
  Sequelize,
} from "sequelize";

export type allowedEquipment = "Excavator" | "Truck" | string;

export type UserPermission = {
  operator: {
    allowedEquipments: allowedEquipment[];
  };
};

export type UserType = "Operator" | "Foreman";

export interface OperatorModel extends Model<
  InferAttributes<OperatorModel>,
  InferCreationAttributes<OperatorModel>
> {
  id: CreationOptional<number>;
  svr_id: CreationOptional<number>;
  name: CreationOptional<string>;
  username: string;
  password: string;
  oracle_number: string;
  last_login: CreationOptional<Date | string>;
  employee_id: CreationOptional<number>;
  type: CreationOptional<UserType>;
  permission_json: CreationOptional<UserPermission>;
  position: CreationOptional<string | null>;
  department: CreationOptional<string | null>;
  /**
   * user's indicator
   */
  online: CreationOptional<boolean>;
  socket_id: CreationOptional<string | null>;
  created_by: string;
  updated_at: CreationOptional<Date | string>;
  updated_by: CreationOptional<string>;
  created_at: CreationOptional<Date | string>;
  deleted_at: CreationOptional<Date | string>;
  deleted_by: CreationOptional<string | null>;
}

export type OperatorInstance = ModelCtor<OperatorModel>;

export const createOperatorModel = (sequelize: Sequelize) => {
  return sequelize.define<
    OperatorModel,
    InferCreationAttributes<OperatorModel>
  >(
    "operator",
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
      },
      svr_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      username: {
        unique: true,
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      oracle_number: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
      },
      created_by: {
        type: DataTypes.STRING(400),
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      position: {
        type: DataTypes.STRING(700),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "Administrator",
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      online: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      socket_id: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      permission_json: {
        type: DataTypes.JSONB,
        allowNull: true,
        get() {
          const data = this.getDataValue("permission_json");

          return (
            data ??
            ({
              operator: {
                allowedEquipments: [],
              },
              user: {
                allowedModules: [],
              },
            } as UserPermission)
          );
        },
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
      deleted_by: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
    },
    {
      name: {
        plural: "operators",
        singular: "operator",
      },
    },
  );
};
