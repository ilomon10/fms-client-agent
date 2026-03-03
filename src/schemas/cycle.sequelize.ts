import {
  CreationOptional,
  ModelCtor,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Optional,
  Sequelize,
} from "sequelize";
import dayjs from "dayjs";

export interface CycleModel
  extends Model<
    InferAttributes<CycleModel>,
    InferCreationAttributes<CycleModel>
  > {
  id: CreationOptional<number>;
  start_equipment_id: number;
  finish_equipment_id: CreationOptional<number | null>;
  start_loading: CreationOptional<string | null>;
  finish_loading: CreationOptional<string | null>;
  hauling: CreationOptional<string | null>;
  arrived_at_dump: CreationOptional<string | null>;
  start_dumping: CreationOptional<string | null>;
  finish_dumping: CreationOptional<string | null>;
  travelling: CreationOptional<string | null>;
  arrived_at_load: CreationOptional<string | null>;
  operator_id: number;
  operator_name: string;
  foreman_id: CreationOptional<number | null>;
  /**
   * Foreman name. For denormalization purpose
   */
  foreman_name: CreationOptional<string | null>;
  /**
   * Material name. For denormalization purpose
   */
  material_name: CreationOptional<string | null>;
  /**
   * Material name. For denormalization purpose
   */
  material_code: CreationOptional<string | null>;
  material_id: CreationOptional<number | null>;
  block_id: CreationOptional<number | null>;
  /**
   * Denormalization column of blocks table
   */
  block_code: CreationOptional<string | null>;
  /**
   * Denormalization column of blocks table
   */
  block_request_level: CreationOptional<number | null>;
  finished: CreationOptional<boolean>;
  is_manually_finished: CreationOptional<boolean>;
  finish_time: CreationOptional<string | null>;
  loading_location_id: number;
  dumping_location_id: number;
  exca_id: CreationOptional<number>;
  location_from_code: CreationOptional<string | null>;
  location_from_name: CreationOptional<string | null>;
  location_to_name: CreationOptional<string | null>;
  location_to_code: CreationOptional<string | null>;
  dumping_cell_code: CreationOptional<string | null>;
  dumping_cell_id: CreationOptional<number | null>;
  exca_hull_number: CreationOptional<string | null>;
  exca_asset_name: CreationOptional<string | null>;
  truck_hull_number: CreationOptional<string | null>;
  truck_asset_name: CreationOptional<string | null>;
  cycle_time: CreationOptional<number>;
  shift: CreationOptional<string | null>;
  session_id: CreationOptional<number | null>;
  tonnes_raw: CreationOptional<number | null>;
  /**
   * Previous session id. Insert this column if the operator need to shift change but the cycle still not yet complete
   */
  previous_session_id: CreationOptional<number | null>;
  remarks: CreationOptional<string | null>;
  schedule_id: CreationOptional<number | null>;
  mine_plan_id: CreationOptional<number | null>;
  created_at: CreationOptional<Date | string>;
  created_by: string;
  updated_at: CreationOptional<Date | string>;
  updated_by: CreationOptional<string>;
}

export type CycleInstance = ModelCtor<CycleModel>;

export const createCycleModel = (sequelize: Sequelize) => {
  return sequelize.define<CycleModel, InferCreationAttributes<CycleModel>>(
    "cycles",
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
      },
      arrived_at_dump: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp when the hauler arrived at dumping point",
      },
      arrived_at_load: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp when the hauler arrived at loading point",
      },
      block_id: {
        type: DataTypes.INTEGER,
        references: {
          key: "id",
          model: "mine_block",
        },
        allowNull: true,
        comment: "Pit's block id. Foreign key to mine_block table",
      },
      block_code: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Denormalization column",
      },
      block_request_level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Denormalization column",
      },
      dumping_location_id: {
        type: DataTypes.INTEGER,
        references: {
          key: "id",
          model: "mine_locations",
        },
        allowNull: false,
      },
      finish_dumping: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp when the hauler finished dumping the material",
      },
      finish_loading: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp when the hauler finished loading the material",
      },
      loading_location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mine_locations",
          key: "id",
        },
      },
      finish_equipment_id: {
        type: DataTypes.INTEGER,
        references: {
          key: "id",
          model: "mine_equipments",
        },
        allowNull: true,
      },
      exca_asset_name: {
        type: DataTypes.STRING(600),
        allowNull: true,
        comment: "Denormalization column",
      },
      exca_hull_number: {
        type: DataTypes.STRING(600),
        allowNull: true,
        comment: "Denormalization column",
      },
      exca_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "mine_equipments",
          key: "id",
        },
      },
      truck_asset_name: {
        type: DataTypes.STRING(600),
        allowNull: true,
        comment: "Denormalization column",
      },
      truck_hull_number: {
        type: DataTypes.STRING(600),
        allowNull: true,
        comment: "Denormalization column",
      },
      dumping_cell_code: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Denormalization column of dumping cell table",
      },
      dumping_cell_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Reference to dumping cell table",
      },
      location_from_code: {
        type: DataTypes.STRING(600),
        allowNull: true,
        comment: "Denormalization column",
      },
      location_from_name: {
        type: DataTypes.STRING(600),
        allowNull: true,
        comment: "Denormalization column",
      },
      location_to_name: {
        type: DataTypes.STRING(600),
        allowNull: true,
        comment: "Denormalization column",
      },
      location_to_code: {
        type: DataTypes.STRING(600),
        allowNull: true,
        comment: "Denormalization column",
      },
      foreman_id: {
        type: DataTypes.INTEGER,
        references: {
          key: "id",
          model: "users",
        },
        allowNull: true,
      },
      material_id: {
        type: DataTypes.INTEGER,
        references: {
          key: "id",
          model: "mine_materials",
        },
        allowNull: false,
      },
      operator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cycle_time: {
        type: DataTypes.VIRTUAL,
        get() {
          const arrivedAtLoad = dayjs(this.arrived_at_load);
          const finishTime = dayjs(this.finish_time);

          if (this.arrived_at_load === null || this.travelling === null)
            return 0;

          return finishTime.diff(arrivedAtLoad, "seconds");
        },
      },
      mine_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "mine_plans",
          key: "id",
        },
      },
      hauling: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      travelling: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      start_dumping: { type: DataTypes.DATE, allowNull: true },
      start_equipment_id: {
        type: DataTypes.INTEGER,
        references: {
          key: "id",
          model: "mine_equipments",
        },
        allowNull: false,
      },
      start_loading: { type: DataTypes.DATE, allowNull: true },
      finished: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_manually_finished: { type: DataTypes.BOOLEAN, defaultValue: false },
      finish_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      tonnes_raw: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      created_by: {
        type: DataTypes.STRING(400),
        allowNull: true,
        defaultValue: "System",
      },
      updated_at: DataTypes.DATE,
      updated_by: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      foreman_name: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Foreman name. For denormalization purpose",
      },
      shift: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: "id",
          model: "sessions",
        },
      },
      previous_session_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment:
          "Previous session id. Insert this column if the operator need to shift change but the cycle still not yet complete",
      },
      schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: "id",
          model: "schedules",
        },
      },
      material_name: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Material name. For denormalization purpose",
      },
      material_code: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Material code. For denormalization purpose",
      },
      operator_name: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Current operator name",
      },
    },
  );
};
