import { DataTableCore } from "./data-table.svelte";
import type {
  DataTableCoreOptions,
  DataTableFeature,
  DataTableFeatureId,
  DataTableFeatureMap,
  DataTableWithFeatures,
} from "./data-table.svelte";
import type { DataTable } from "./rendered-table";

export interface CreateDataTableOptions<
  TData,
  TFeatures extends readonly DataTableFeature<object>[],
> extends DataTableCoreOptions<TData> {
  features: TFeatures;
}

export function createDataTable<TData>(
  options: CreateDataTableOptions<TData, readonly DataTableFeature<object>[]>,
): DataTable<TData>;
export function createDataTable<TData, const TFeatures extends readonly DataTableFeature<object>[]>(
  options: CreateDataTableOptions<TData, TFeatures>,
): DataTableWithFeatures<TData, unknown, TFeatures>;
export function createDataTable<TData>(
  options: CreateDataTableOptions<TData, readonly DataTableFeature<object>[]>,
): DataTableCore<TData> & object {
  const table = new DataTableCore<TData>(options);
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
