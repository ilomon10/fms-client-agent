import { DatabaseSync } from "node:sqlite";
import { Id, Paginated, Params } from "./client.ts";

export type ColumnType = "TEXT" | "INT" | "REAL" | "BOOLEAN" | "DATETIME";
export type SchemaDefinition = Record<string, ColumnType>;

function columnToSQL(name: string, type: ColumnType): string {
  return `${name} ${type}`;
}

export class CreateStore<
  Result = any,
  Data = Partial<Result>,
  PatchData = Data,
  FindResult = Paginated<Result>,
  P extends { query?: Record<string, any> } = Params,
> {
  public db: DatabaseSync;

  constructor(
    public name: string,
    schema: SchemaDefinition,
  ) {
    this.db = new DatabaseSync("local.db");

    const columns = Object.entries(schema)
      .map(([name, type]) => columnToSQL(name, type))
      .join(",\n");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${name} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ${columns},
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async find(params?: P): Promise<FindResult> {
    const limit = (params?.query?.$limit as number) ?? 10;
    const skip = (params?.query?.$skip as number) ?? 0;

    let sql = `SELECT * FROM ${this.name}`;
    const conditions: string[] = [];
    const values: any[] = [];

    if (params?.query) {
      for (const [key, value] of Object.entries(params.query)) {
        if (key === "$limit" || key === "$skip") continue;
        conditions.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (conditions.length) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += ` LIMIT ? OFFSET ?`;
    values.push(limit, skip);

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...values);

    const countStmt = this.db.prepare(
      `SELECT COUNT(*) as total FROM ${this.name}`,
    );
    const countRow = countStmt.get() as { total: number } | undefined;
    const count = countRow?.total ?? 0;

    return {
      total: count,
      limit,
      skip,
      data: rows,
    } as FindResult;
  }

  // async findOne(params?: P): Promise<Result> {
  //   const limit = (params?.query?.$limit as number) ?? 10;
  //   const skip = (params?.query?.$skip as number) ?? 0;
  //
  //   let sql = `SELECT * FROM ${this.name}`;
  //   const conditions: string[] = [];
  //   const values: any[] = [];
  //
  //   if (params?.query) {
  //     for (const [key, value] of Object.entries(params.query)) {
  //       if (key === "$limit" || key === "$skip") continue;
  //       conditions.push(`${key} = ?`);
  //       values.push(value);
  //     }
  //   }
  //
  //   if (conditions.length) {
  //     sql += " WHERE " + conditions.join(" AND ");
  //   }
  //
  //   sql += ` LIMIT ? OFFSET ?`;
  //   values.push(limit, skip);
  //
  //   const stmt = this.db.prepare(sql);
  //   const rows = stmt.all(...values);
  //
  //   return rows[0];
  // }

  async get(id: Id, _params?: P): Promise<Result> {
    const stmt = this.db.prepare(`SELECT * FROM ${this.name} WHERE id = ?`);
    const row = stmt.get(id);
    return row as Result;
  }

  create(data: Data[], _params?: P): Promise<Result[]>;
  create(data: Data, _params?: P): Promise<Result>;
  async create(data: Data | Data[], _params?: P): Promise<Result | Result[]> {
    const items = Array.isArray(data) ? data : [data];

    const insertedRows: Result[] = [];
    for (const item of items) {
      const keys = Object.keys(item as object);
      const placeholders = keys.map(() => "?").join(", ");
      const values = keys.map((key) => (item as any)[key]);

      const stmt = this.db.prepare(
        `INSERT INTO ${this.name} (${keys.join(", ")}) VALUES (${placeholders})`,
      );

      stmt.run(...values);

      const lastIdStmt = this.db.prepare(`SELECT last_insert_rowid() as id`);
      const lastIdRow = lastIdStmt.get() as { id: number };
      const insertedRow = await this.get(lastIdRow.id);
      insertedRows.push(insertedRow);
    }

    return Array.isArray(data) ? insertedRows : insertedRows[0];
  }

  async patch(id: Id, data: PatchData, _params?: P): Promise<Result> {
    if (typeof data !== "object" || data === null) {
      throw new Error("Patch data must be a non-null object");
    }

    const entries = Object.entries(data as Record<string, any>);
    const updates = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = [...entries.map(([_, value]) => value), id];

    const stmt = this.db.prepare(
      `UPDATE ${this.name} SET ${updates}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    );
    stmt.run(...values);

    return this.get(id);
  }

  async remove(id: Id, _params?: P): Promise<Result> {
    const old = await this.get(id);
    const stmt = this.db.prepare(`DELETE FROM ${this.name} WHERE id = ?`);
    stmt.run(id);
    return old;
  }
}
