import type { LeafColumn } from "../column-types";
import type {
  ColumnFilteringFeature,
  DataTableFilter,
  DataTableFilterDefinition,
  DataTableFilterValue,
} from "../features/column-filtering.svelte";
import { BaseService } from "./base-service";

/**
 * Service for mutating active filters in the data grid.
 */
export class FilteringService<TFilter = DataTableFilter> extends BaseService {
  get filters(): TFilter[] {
    return this.filtering.filters;
  }

  get filterDefinitions(): readonly DataTableFilterDefinition<string, any, TFilter>[] {
    return this.filtering.filterDefinitions;
  }

  getFilter<TCurrentFilter extends TFilter = TFilter>(filterId: string): TCurrentFilter | null {
    return this.filtering.getFilter<TCurrentFilter>(filterId);
  }

  getFilterId(filter: TFilter): string {
    return this.filtering.getFilterId(filter);
  }

  getFilterOperator(filter: TFilter): DataTableFilter["operator"] {
    return this.filtering.getFilterOperator(filter);
  }

  getFilterType(filter: TFilter): DataTableFilter["type"] {
    return this.filtering.getFilterType(filter);
  }

  getFilterValue(filter: TFilter): DataTableFilterValue {
    return this.filtering.getFilterValue(filter);
  }

  getFilterValueById(filterId: string): DataTableFilterValue | null {
    const filter = this.getFilter(filterId);
    return filter ? this.getFilterValue(filter) : null;
  }

  getVisibleActiveFilterCount(): number {
    const visibleFilterIds = new Set(
      this.filterDefinitions.filter((definition) => !definition.hidden).map((definition) => definition.filterId),
    );

    return this.filters.filter((filter) => visibleFilterIds.has(this.getFilterId(filter))).length;
  }

  setColumnFilter(column: LeafColumn<any>, filter: TFilter): void {
    this.setFilter(column.columnId, filter, column);
  }

  setFilter(filterId: string, filter: TFilter, column?: LeafColumn<any>): void {
    if (this.getFilterId(filter) !== filterId) {
      throw new Error(`Filter does not match target filter id ${filterId}`);
    }

    if (!this.isFilterable(filterId)) {
      return;
    }

    this.filtering.setFilter(filterId, filter);
    this.refreshFiltering(filterId, column);
  }

  setFilterValue(filterId: string, value: DataTableFilterValue, operator?: DataTableFilter["operator"]): void {
    if (!this.isFilterable(filterId)) {
      return;
    }

    const filter = this.filtering.createFilter(filterId, value, operator);
    if (!filter || !this.filtering.isFilterActive(filter)) {
      this.removeFilter(filterId);
      return;
    }

    this.filtering.setFilter(filterId, filter);
    this.refreshFiltering(filterId);
  }

  removeFilter(filterId: string): void {
    this.filtering.removeFilter(filterId);
    this.refreshFiltering(filterId);
  }

  clearFilters(): void {
    this.filtering.clearFilters();
    this.refreshFiltering();
  }

  private isFilterable(filterId: string): boolean {
    const definition = this.filterDefinitions.find((current) => current.filterId === filterId);
    if (definition) return true;

    const column = this.datagrid.columns.findColumnById(filterId);
    if (column?.type === "accessor" || column?.type === "computed") return column.options.filterable;

    throw new Error(`Filter ${filterId} not found`);
  }

  private get filtering(): ColumnFilteringFeature<any, TFilter> {
    return this.datagrid.features.filtering as ColumnFilteringFeature<any, TFilter>;
  }

  private refreshFiltering(filterId?: string, column?: LeafColumn<any>): void {
    this.datagrid.events.emit("onFilterChange", { column, filterId });
    this.datagrid.cacheManager.invalidate("filteredData");
    this.datagrid.features.pagination.goToFirstPage();
    this.datagrid.processors.data.executeFullDataTransformation();
  }
}
