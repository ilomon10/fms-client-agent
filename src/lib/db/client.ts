/**
 * The object returned from `.find` call by standard database adapters
 */
export interface Paginated<T> {
  total: number;
  limit: number;
  skip: number;
  data: T[];
}

export interface Query {
  [key: string]: any;
}

export interface Params<Q = Query> {
  query?: Q;
  provider?: string;
  route?: { [key: string]: any };
  headers?: { [key: string]: any };
}

export type Id = number | string;
export type NullableId = Id | null;

export interface ClientAdapter<
  Result = any,
  Data = Partial<Result>,
  PatchData = Data,
  FindResult = Paginated<Result>,
  P = Params
> {
  find(params?: P): Promise<Result>;
  find(params?: P): Promise<FindResult>;

  get(id: Id, params?: P): Promise<Result>;

  create(data: Data[], params?: P): Promise<Result[]>;
  create(data: Data, params?: P): Promise<Result>;

  update(id: Id, data: Data, params?: P): Promise<Result>;
  update(id: NullableId, data: Data, params?: P): Promise<Result | Result[]>;
  update(id: null, data: Data, params?: P): Promise<Result[]>;

  patch(
    id: NullableId,
    data: PatchData,
    params?: P
  ): Promise<Result | Result[]>;
  patch(id: Id, data: PatchData, params?: P): Promise<Result>;
  patch(id: null, data: PatchData, params?: P): Promise<Result[]>;

  remove(id: NullableId, params?: P): Promise<Result | Result[]>;
  remove(id: Id, params?: P): Promise<Result>;
  remove(id: null, params?: P): Promise<Result[]>;
}
