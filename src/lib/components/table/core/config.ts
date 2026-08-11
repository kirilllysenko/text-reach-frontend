import type { ColumnDef } from "./column-types";
import type { DataTableLoader, DataLoadingFeatureConfig } from "./features/data-loading.svelte";
import type { InitialState, FeatureOverrides } from "./features/types";
import type { DataTableSort } from "./features/sorting.svelte";
import type { LifecycleHooks } from "./managers/lifecycle-hooks-manager.svelte";

export type DefaultColumnSize = {
  width: number;
  minWidth: number;
  maxWidth: number;
};

export type DefaultColumnConfig = {
  size?: DefaultColumnSize;
};

export type DatagridCoreConfigDefaults = {
  column?: DefaultColumnConfig;
};

type SharedDatagridCoreConfig<TOriginalRow, C extends ColumnDef<TOriginalRow>> = {
  columns: C[];
  lifecycleHooks?: LifecycleHooks<TOriginalRow>;
  measurePerformance?: boolean;
  rowIdGetter?: (row: TOriginalRow) => string;
  rowIndexGetter?: (row: TOriginalRow, parentIndex: string | null, index: number) => string;
  features?: FeatureOverrides;
  default?: DatagridCoreConfigDefaults;
};

type LocalDatagridCoreConfig<TOriginalRow, TSort> = {
  data: TOriginalRow[];
  initialState?: InitialState<TOriginalRow, TSort>;
};

type LoaderDatagridCoreConfig<TOriginalRow, TSort> = {
  data?: TOriginalRow[];
  initialState: InitialState<TOriginalRow, TSort> & {
    dataLoading: DataLoadingFeatureConfig<TOriginalRow, TSort> & { loader: DataTableLoader<TOriginalRow, TSort> };
  };
};

export type DatagridCoreConfig<
  TOriginalRow,
  TSort = DataTableSort,
  C extends ColumnDef<TOriginalRow> = ColumnDef<TOriginalRow>,
> = SharedDatagridCoreConfig<TOriginalRow, C> &
  (LocalDatagridCoreConfig<TOriginalRow, TSort> | LoaderDatagridCoreConfig<TOriginalRow, TSort>);
