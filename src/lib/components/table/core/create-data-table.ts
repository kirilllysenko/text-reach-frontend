import { DataTableCore } from "./data-table.svelte";
import type {
  DataTableCoreOptions,
  DataTableFeature,
  DataTableFeatureId,
  DataTableFeatureMap,
  DataTableWithFeatures,
} from "./data-table.svelte";
import type { ColumnFeatureApi } from "./features/column.svelte";
import type { InfiniteLoaderFeatureApi } from "./features/infinite-loader.svelte";

export interface CreateDataTableOptions<
  TData,
  TFeatures extends readonly DataTableFeature<object>[],
> extends DataTableCoreOptions<TData> {
  features: TFeatures;
}

type FeatureApi<TFeature> = TFeature extends DataTableFeature<infer TApi> ? TApi : never;
type FeatureData<TApi> =
  TApi extends ColumnFeatureApi<infer TData, infer _TMeta>
    ? TData
    : TApi extends InfiniteLoaderFeatureApi<infer TData>
      ? TData
      : never;
type NonNever<TValue, TFallback> = [TValue] extends [never] ? TFallback : TValue;

export type DataTableData<TFeatures extends readonly DataTableFeature<object>[]> = NonNever<
  FeatureData<FeatureApi<TFeatures[number]>>,
  unknown
>;

export function createDataTable<const TFeatures extends readonly DataTableFeature<object>[]>(
  options: CreateDataTableOptions<DataTableData<TFeatures>, TFeatures>,
): DataTableWithFeatures<DataTableData<TFeatures>, unknown, TFeatures>;
export function createDataTable<TData, const TFeatures extends readonly DataTableFeature<object>[]>(
  options: CreateDataTableOptions<TData, TFeatures>,
): DataTableWithFeatures<TData, unknown, TFeatures>;
export function createDataTable(
  options: CreateDataTableOptions<unknown, readonly DataTableFeature<object>[]>,
): DataTableCore<unknown> & object {
  const table = new DataTableCore<unknown>(options);
  const featureMap = createFeatureMap(options.features);
  const installedFeatureIds = new Set<DataTableFeatureId>();

  options.features.forEach((feature) => {
    assertFeatureDependencies(feature, featureMap, installedFeatureIds);
    const api = feature.install(table);
    Object.defineProperties(table, Object.getOwnPropertyDescriptors(api));
    installedFeatureIds.add(feature.id);
  });

  return table;
}

function createFeatureMap(features: readonly DataTableFeature<object>[]): DataTableFeatureMap {
  const featureMap: DataTableFeatureMap = new Map();

  features.forEach((feature) => {
    if (featureMap.has(feature.id)) {
      throw new Error(`Duplicate DataTable feature "${feature.id}".`);
    }

    featureMap.set(feature.id, feature);
  });

  return featureMap;
}

function assertFeatureDependencies(
  feature: DataTableFeature<object>,
  featureMap: DataTableFeatureMap,
  installedFeatureIds: ReadonlySet<DataTableFeatureId>,
): void {
  feature.dependencies.forEach((dependency) => {
    if (!featureMap.has(dependency)) {
      throw new Error(`DataTable feature "${feature.id}" requires missing feature "${dependency}".`);
    }

    if (!installedFeatureIds.has(dependency)) {
      throw new Error(`DataTable feature "${feature.id}" requires "${dependency}" to be installed first.`);
    }
  });
}
