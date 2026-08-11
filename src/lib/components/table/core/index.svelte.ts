import type { ColumnDef } from "./column-types";
import type { DatagridCoreConfig, DefaultColumnConfig } from "./config";
import { DatagridFeatures } from "./features/features.svelte";
import { PerformanceMetrics } from "./helpers/performance-metrics.svelte";
import { ColumnsManager, DatagridCacheManager, RowsManager } from "./managers";
import { HandlersManager } from "./managers/handler-manager";
import { LifecycleHooks } from "./managers/lifecycle-hooks-manager.svelte";
import { ColumnProcessor, DataProcessor } from "./processors";
import type { GridRowIdentifier } from "./row-types";
import type { DataTableSort } from "./features/sorting.svelte";
import { EventService } from "./services/event-service";
import { flattenColumnStructureAndClearGroups } from "./utils.svelte";

type NormalizedDatagridConfig<TOriginalRow, TSort> = DatagridCoreConfig<TOriginalRow, TSort> & {
  data: TOriginalRow[];
};

export class DatagridCore<TOriginalRow = any, TSort = DataTableSort, TMeta = any> {
  readonly events: EventService;
  readonly performanceMetrics: PerformanceMetrics;
  readonly handlers: HandlersManager<TOriginalRow, TSort>;
  readonly columns: ColumnsManager<TOriginalRow>;
  readonly rows: RowsManager<TOriginalRow>;
  readonly processors: {
    data: DataProcessor<TOriginalRow>;
    column: ColumnProcessor<TOriginalRow>;
  };
  readonly cacheManager: DatagridCacheManager<TOriginalRow>;
  readonly lifecycleHooks: LifecycleHooks<TOriginalRow>;
  readonly features: DatagridFeatures<TOriginalRow, TSort>;

  originalState = $state.raw({
    columns: [] as ColumnDef<TOriginalRow, TMeta>[],
    data: [] as TOriginalRow[],
  });
  _columns: ColumnDef<TOriginalRow, TMeta>[] = $state([]);
  measurePerformance = $state(false);

  rowIdGetter: (row: TOriginalRow) => GridRowIdentifier;
  rowIndexGetter: (row: TOriginalRow, parentIndex: string | null, index: number) => string;

  constructor(config: DatagridCoreConfig<TOriginalRow, TSort>) {
    const normalizedConfig = this.normalizeConfiguration(config);

    this.events = new EventService();
    this.performanceMetrics = new PerformanceMetrics();
    this.lifecycleHooks = normalizedConfig.lifecycleHooks ?? new LifecycleHooks<TOriginalRow>();
    this.measurePerformance = normalizedConfig.measurePerformance ?? false;
    this.rowIdGetter = normalizedConfig.rowIdGetter ?? this.defaultRowIdGetter;
    this.rowIndexGetter = normalizedConfig.rowIndexGetter ?? this.defaultRowIndexGetter;

    this.cacheManager = new DatagridCacheManager();
    this.columns = new ColumnsManager(this as DatagridCore<TOriginalRow, any>);
    this.rows = new RowsManager(this as DatagridCore<TOriginalRow, any>);
    this.processors = {
      column: new ColumnProcessor(this as DatagridCore<TOriginalRow, any>),
      data: new DataProcessor(this as DatagridCore<TOriginalRow, any>),
    };
    this.features = new DatagridFeatures(this, normalizedConfig);
    this.handlers = new HandlersManager(this, this.events);

    this.initializeGridState(normalizedConfig);
  }

  replaceData(data: TOriginalRow[]): void {
    this.initializeSourceData(data);
    this.cacheManager.invalidate("everything");
    this.processors.data.executeFullDataTransformation();
  }

  refresh(
    updateOperation: () => void,
    options: {
      recalculateAll?: boolean;
      recalculateGroups?: boolean;
      recalculatePagination?: boolean;
    } = {},
  ): void {
    const timeStart = performance.now();
    updateOperation();

    const { recalculateAll = false, recalculateGroups = false, recalculatePagination = true } = options;
    if (recalculateAll) {
      this.processors.data.executeFullDataTransformation();
    } else if (recalculateGroups) {
      this.processors.data.handleGroupExpansion();
    } else if (recalculatePagination) {
      this.processors.data.handlePaginationChange();
    }

    if (this.measurePerformance) console.log(`Operation took ${performance.now() - timeStart}ms`);
  }

  private initializeGridState(config: NormalizedDatagridConfig<TOriginalRow, TSort>): void {
    this.initializeSourceColumns(config.columns, config.default?.column);
    this.initializeSourceData(config.data);
    this._columns = this.processors.column.initializeColumns(this.originalState.columns);
    this.processors.data.executeFullDataTransformation();
  }

  private initializeSourceColumns(columns: ColumnDef<TOriginalRow>[], defaults?: DefaultColumnConfig): void {
    const flatColumns = flattenColumnStructureAndClearGroups(this.processors.column.assignParentColumnIds(columns));
    const sizedColumns = this.processors.column.applyDefaultColumnSizes(flatColumns, defaults);
    const hierarchy = this.processors.column.createColumnHierarchy(sizedColumns);
    const preprocessedColumns = this.lifecycleHooks.executePreProcessOriginalColumns(hierarchy);
    this.originalState.columns = this.lifecycleHooks.executePostProcessOriginalColumns(preprocessedColumns);
  }

  private initializeSourceData(data: TOriginalRow[]): void {
    const preprocessedData = this.lifecycleHooks.executePreProcessData(data);
    this.originalState.data = this.lifecycleHooks.executePostProcessData(preprocessedData);
  }

  private normalizeConfiguration(
    config: DatagridCoreConfig<TOriginalRow, TSort>,
  ): NormalizedDatagridConfig<TOriginalRow, TSort> {
    if (!Array.isArray(config.columns) || config.columns.length === 0) {
      throw new Error("Columns must be a non-empty array");
    }

    const loader = config.initialState?.dataLoading?.loader;
    if (typeof config.data === "undefined" && !loader) {
      throw new Error("Data is required when no data loader is configured");
    }
    if (typeof config.data !== "undefined" && !Array.isArray(config.data)) {
      throw new Error("Data must be an array");
    }

    const pagination = config.initialState?.pagination;
    const normalizedPagination = loader
      ? {
          pageSize: pagination?.pageSize ?? 500,
          ...pagination,
        }
      : pagination;

    return {
      ...config,
      data: config.data ?? [],
      initialState: {
        ...config.initialState,
        ...(normalizedPagination ? { pagination: normalizedPagination } : {}),
      },
    };
  }

  private defaultRowIdGetter = (row: TOriginalRow): GridRowIdentifier => (row as TOriginalRow & { id: string }).id;

  private defaultRowIndexGetter = (_row: TOriginalRow, parentIndex: string | null, index: number): string =>
    parentIndex ? `${parentIndex}-${index + 1}` : String(index + 1);
}
