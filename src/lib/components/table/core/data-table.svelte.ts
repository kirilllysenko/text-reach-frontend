import { EventService } from "./events";
import { RowsFeature } from "./features/rows.svelte";
import type { Snippet } from "svelte";

export interface DataTableCoreOptions<TData> {
  empty?: Snippet;
  getRowId?: (row: TData, index: number) => string;
  loadingError?: Snippet;
}

export type DataTableFeatureId =
  | "column"
  | "columnOrder"
  | "columnVisibility"
  | "filters"
  | "infiniteLoader"
  | "sorting"
  | "virtualWindow";

export interface DataTableFeature<TApi extends object, TId extends DataTableFeatureId = DataTableFeatureId> {
  dependencies: readonly DataTableFeatureId[];
  id: TId;
  install<TData, TMeta>(table: DataTableCore<TData, TMeta> & object): TApi;
}

export type DataTableFeatureMap = Map<DataTableFeatureId, DataTableFeature<object>>;

type UnionToIntersection<TValue> = (TValue extends unknown ? (value: TValue) => void : never) extends (
  value: infer TIntersection,
) => void
  ? TIntersection
  : never;

type FeatureApi<TFeature> = TFeature extends DataTableFeature<infer TApi> ? TApi : never;

export type DataTableWithFeatures<TData, TMeta, TFeatures extends readonly DataTableFeature<object>[]> = DataTableCore<
  TData,
  TMeta
> &
  UnionToIntersection<FeatureApi<TFeatures[number]>>;

export class DataTableCore<TData, TMeta = unknown> {
  readonly events = new EventService();
  readonly rows = new RowsFeature<TData>();
  private readonly disposers: (() => void)[] = [];

  constructor(readonly options: DataTableCoreOptions<TData>) {}

  get statusLabel(): string {
    const totalRows = this.rows.totalRows;
    return totalRows === null ? `${this.rows.loadedCount} loaded` : `${this.rows.loadedCount} of ${totalRows} loaded`;
  }

  get visibleRows(): TData[] {
    return this.rows.items;
  }

  addDisposer(disposer: () => void): void {
    this.disposers.push(disposer);
  }

  appendRows(rows: TData[], nextCursor: unknown[] | null, totalRows?: number): void {
    this.rows.append(rows, nextCursor, totalRows);
  }

  dispose(): void {
    this.disposers.splice(0).forEach((dispose) => dispose());
  }

  resetRows(): void {
    this.rows.reset();
  }

  setRows(rows: TData[], nextCursor: unknown[] | null, totalRows?: number): void {
    this.rows.set(rows, nextCursor, totalRows);
  }
}
