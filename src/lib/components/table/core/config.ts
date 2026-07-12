import type { ColumnDef } from "./column-types";
import type { DataField } from "./data-types";
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

export type DatagridCoreConfig<TOriginalRow, C extends ColumnDef<TOriginalRow> = ColumnDef<TOriginalRow>> = {
  columns: C[];
  data: TOriginalRow[];
  dataFields?: DataField<TOriginalRow>[];
  lifecycleHooks?: LifecycleHooks<TOriginalRow>;
  initialState?: InitialState;
  measurePerformance?: boolean;
  rowIdGetter?: (row: TOriginalRow) => string;
  rowIndexGetter?: (row: TOriginalRow) => string;
  features?: FeatureOverrides;
  default?: DatagridCoreConfigDefaults;
};
