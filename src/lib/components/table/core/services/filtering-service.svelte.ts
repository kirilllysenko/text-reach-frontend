import type { DataTableFilter, DataTableFilterDefinition, LeafColumn } from "../types";
import { BaseService } from "./base-service";

/**
 * Service for mutating active filters in the data grid.
 */
export class FilteringService<TSortId extends string = string> extends BaseService<TSortId> {
  get filters(): DataTableFilter[] {
    return this.datagrid.features.filtering.filters;
  }

  get filterDefinitions(): readonly DataTableFilterDefinition[] {
    return this.datagrid.features.filtering.filterDefinitions;
  }

  setColumnFilter(column: LeafColumn<any>, filter: DataTableFilter): void {
    this.setFilter(column.columnId, filter, column);
  }

  setFilter(filterId: string, filter: DataTableFilter, column?: LeafColumn<any>): void {
    if (filter.filterId !== filterId) {
      throw new Error(`Filter id ${filter.filterId} does not match target filter id ${filterId}`);
    }

    const fieldId = this.datagrid.features.filtering.getFilterFieldId(filter);
    const field = this.datagrid.dataFields.findFieldByIdOrThrow(fieldId);

    if (field.filterable === false) {
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

  private refreshFiltering(filterId?: string, column?: LeafColumn<any>): void {
    this.datagrid.events.emit("onFilterChange", { column, filterId });
    this.datagrid.cacheManager.invalidate("filteredData");
    this.datagrid.features.pagination.goToFirstPage();
    this.datagrid.processors.data.executeFullDataTransformation();
  }
}
