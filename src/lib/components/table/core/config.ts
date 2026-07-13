import type { ColumnDef } from "./column-types";
import type { DataTableLoader, DataLoadingFeatureConfig } from "./features/data-loading.svelte";
import type { InitialState, FeatureOverrides } from "./features/types";
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

type LocalDatagridCoreConfig<TOriginalRow> = {
  data: TOriginalRow[];
  initialState?: InitialState<TOriginalRow>;
};

type LoaderDatagridCoreConfig<TOriginalRow> = {
  data?: TOriginalRow[];
  initialState: InitialState<TOriginalRow> & {
    dataLoading: DataLoadingFeatureConfig<TOriginalRow> & { loader: DataTableLoader<TOriginalRow> };
  };
};

export type DatagridCoreConfig<
  TOriginalRow,
  C extends ColumnDef<TOriginalRow> = ColumnDef<TOriginalRow>,
> = SharedDatagridCoreConfig<TOriginalRow, C> &
  (LocalDatagridCoreConfig<TOriginalRow> | LoaderDatagridCoreConfig<TOriginalRow>);
