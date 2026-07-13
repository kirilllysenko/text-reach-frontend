import type { LeafColumn } from "../column-types";
import type { DataTableFilter, DataTableFilterDefinition } from "../features/column-filtering.svelte";
import { BaseService } from "./base-service";

/**
 * Service for mutating active filters in the data grid.
 */
export class FilteringService extends BaseService {
  get filters(): DataTableFilter[] {
    return this.datagrid.features.filtering.filters;
  }

  get filterDefinitions(): readonly DataTableFilterDefinition[] {
    return this.datagrid.features.filtering.filterDefinitions;
  }

  getVisibleActiveFilterCount(): number {
    const visibleFilterIds = new Set(
      this.filterDefinitions.filter((definition) => !definition.hidden).map((definition) => definition.filterId),
    );

    return this.filters.filter((filter) => visibleFilterIds.has(filter.filterId)).length;
  }

  setColumnFilter(column: LeafColumn<any>, filter: DataTableFilter): void {
    this.setFilter(column.columnId, filter, column);
  }

  setFilter(filterId: string, filter: DataTableFilter, column?: LeafColumn<any>): void {
    if (filter.filterId !== filterId) {
      throw new Error(`Filter id ${filter.filterId} does not match target filter id ${filterId}`);
    }

    if (!this.isFilterable(filterId)) {
      return;
    }

    this.datagrid.features.filtering.setFilter(filterId, filter);
    this.refreshFiltering(filterId, column);
  }

  removeFilter(filterId: string): void {
    this.datagrid.features.filtering.removeFilter(filterId);
    this.refreshFiltering(filterId);
  }

  clearFilters(): void {
    this.datagrid.features.filtering.clearFilters();
    this.refreshFiltering();
  }

  private isFilterable(filterId: string): boolean {
    const definition = this.filterDefinitions.find((current) => current.filterId === filterId);
    if (definition) return true;

    const column = this.datagrid.columns.findColumnById(filterId);
    if (column?.type === "accessor" || column?.type === "computed") return column.options.filterable;

    throw new Error(`Filter ${filterId} not found`);
  }

  private refreshFiltering(filterId?: string, column?: LeafColumn<any>): void {
    this.datagrid.events.emit("onFilterChange", { column, filterId });
    this.datagrid.cacheManager.invalidate("filteredData");
    this.datagrid.features.pagination.goToFirstPage();
    this.datagrid.processors.data.executeFullDataTransformation();
  }
}
