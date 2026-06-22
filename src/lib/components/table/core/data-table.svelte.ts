import { EventService } from "./events";
import { RowsFeature } from "./features/rows.svelte";

export interface DataTableCoreOptions<TData> {
  emptyLabel?: string;
  errorLabel?: string;
  getRowId?: (row: TData, index: number) => string;
}

export interface DataTableFeature<TApi extends object> {
  install<TData, TMeta>(table: DataTableCore<TData, TMeta> & object): TApi;
}

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
