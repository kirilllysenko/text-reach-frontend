import type { DatagridCore } from "../index.svelte";
import type { ColumnId, Sorting, SortingDirection } from "../types";

/**
 * Represents the state of the sorting feature in the datagrid.
 */
export type SortingFeatureState = {
  sortConfigs: Sorting[]; // List of sort configurations for each sorted column
  isManual: boolean; // Indicates if sorting is manual or automatic
  allowMultiSort: boolean; // Whether multiple column sorting is allowed
  maxMultiSortColumns: number; // Maximum number of columns that can be sorted simultaneously
};

/**
 * Interface for methods related to the sorting feature.
 */
export type ISortingFeature = {
  clearSortConfigs(): void; // Clears all sort configurations
  removeSortConfig(fieldId: ColumnId): void; // Removes the sort configuration for a specific field
  changeSortConfigDirection(fieldId: ColumnId, direction: SortingDirection): void; // Changes the sort direction for a field
  addSortConfig(fieldId: ColumnId, direction: SortingDirection): void; // Adds a new sort configuration for a field
  isColumnSorted(fieldId: ColumnId, direction?: SortingDirection): boolean; // Checks if a field is sorted, optionally with a specific direction
  findSortConfigIndex(fieldId: ColumnId): number; // Finds the index of the sort configuration for a field
  findSortConfigByColumnId(fieldId: ColumnId): Sorting | undefined; // Finds the sort configuration for a field by its ID
} & SortingFeatureState;

/**
 * Configuration options for the sorting feature.
 */
export type SortingFeatureConfig = Partial<SortingFeatureState>;

/**
 * Manages sorting configurations for the datagrid, allowing sorting by one or more columns.
 */
export class SortingFeature implements ISortingFeature {
  datagrid: DatagridCore<any>; // The datagrid instance associated with the sorting feature
  sortConfigs: Sorting[] = $state([]); // List of sort configurations, each representing a column's sort state
  isManual: boolean = $state(false); // Whether sorting is manual or automatic
  allowMultiSort: boolean = $state(true); // Whether multi-column sorting is allowed
  maxMultiSortColumns: number = $state(Infinity); // Maximum number of sortable columns
  onSortingChange: (config: SortingFeature) => void = () => {}; // Callback for sorting changes

  /**
   * Initializes the sorting feature for a given datagrid.
   * @param datagrid The datagrid instance.
   * @param config Optional configuration for the sorting feature.
   */
  constructor(datagrid: DatagridCore<any>, config?: SortingFeatureConfig) {
    this.datagrid = datagrid;
    Object.assign(this, config);
  }

  /**
   * Retrieves the sort configuration for a column by its ID.
   * @param columnId The column ID to retrieve the sort configuration for.
   * @returns The sort configuration or undefined if not found.
   */
  getSortConfigByColumnId(fieldId: ColumnId): Sorting | undefined {
    return this.findSortConfigByFieldId(fieldId);
  }

  getSortConfigByFieldId(fieldId: ColumnId): Sorting | undefined {
    return this.findSortConfigByFieldId(fieldId);
  }

  /**
   * Finds the sort configuration for a column by its ID.
   * @param columnId The column ID to find the sort configuration for.
   * @returns The sort configuration or undefined if not found.
   */
  findSortConfigByColumnId(fieldId: ColumnId): Sorting | undefined {
    return this.findSortConfigByFieldId(fieldId);
  }

  findSortConfigByFieldId(fieldId: ColumnId): Sorting | undefined {
    return this.sortConfigs.find((config) => this.getSortConfigFieldId(config) === fieldId);
  }

  /**
   * Finds the index of the sort configuration for a column.
   * @param columnId The column ID to find the index for.
   * @returns The index of the sort configuration, or -1 if not found.
   */
  findSortConfigIndex(fieldId: ColumnId): number {
    return this.sortConfigs.findIndex((config) => this.getSortConfigFieldId(config) === fieldId);
  }

  /**
   * Retrieves the index of the sort configuration in the datagrid.
   * @param columnId The column ID to get the sort configuration index for.
   * @returns The index of the sort configuration or null if not found.
   */
  getSortConfigIndex = (fieldId: ColumnId): number | null => {
    const sortConfig = this.getSortConfigByFieldId(fieldId);
    return sortConfig ? this.datagrid.features.sorting.sortConfigs.indexOf(sortConfig) + 1 : null;
  };

  /**
   * Retrieves the sort direction for a column.
   * @param columnId The column ID to get the sort direction for.
   * @returns The sort direction, or 'intermediate' if no direction is set.
   */
  getSortDirection = (fieldId: ColumnId): SortingDirection => {
    const sortConfig = this.getSortConfigByFieldId(fieldId);
    if (!sortConfig) return "intermediate";
    return sortConfig.direction;
  };

  /**
   * Clears all sort configurations.
   */
  clearSortConfigs() {
    this.sortConfigs = [];
  }

  /**
   * Removes the sort configuration for a specific column.
   * @param columnId The column ID to remove the sort configuration for.
   */
  removeSortConfig(fieldId: ColumnId) {
    this.sortConfigs = this.sortConfigs.filter((config) => this.getSortConfigFieldId(config) !== fieldId);
  }

  /**
   * Changes the sort direction for a specific column.
   * @param columnId The column ID to change the sort direction for.
   * @param direction The new sort direction.
   */
  changeSortConfigDirection(fieldId: ColumnId, direction: SortingDirection) {
    const index = this.findSortConfigIndex(fieldId);
    if (index === -1) return; // If the column is not sorted, do nothing

    // Update the sort direction for the specified column
    this.sortConfigs = this.sortConfigs.map((config, i) => (i === index ? { ...config, direction } : config));
  }

  /**
   * Adds a new sort configuration for a column.
   * @param columnId The column ID to add the sort configuration for.
   * @param direction The sort direction.
   */
  addSortConfig(fieldId: ColumnId, direction: SortingDirection) {
    const field = this.datagrid.dataFields.findFieldByIdOrThrow(fieldId);
    if (field.sortable === false) return;
    if (this.sortConfigs.length >= this.maxMultiSortColumns) return;
    this.sortConfigs = [...this.sortConfigs, { fieldId, direction }];
  }

  /**
   * Checks if a column is sorted, optionally with a specific direction.
   * @param columnId The column ID to check.
   * @param direction The direction to check for (optional).
   * @returns True if the column is sorted with the specified direction, otherwise false.
   */
  isColumnSorted(fieldId: ColumnId, direction?: SortingDirection): boolean {
    if (!direction) return this.sortConfigs.some((config) => this.getSortConfigFieldId(config) === fieldId);

    // Return true if the column is sorted with the specified direction
    return this.sortConfigs.some(
      (config) => this.getSortConfigFieldId(config) === fieldId && config.direction === direction,
    );
  }

  getSortConfigFieldId(config: Sorting): string {
    return this.datagrid.dataFields.getSortFieldId(config);
  }
}
