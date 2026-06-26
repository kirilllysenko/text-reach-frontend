import type { DatagridCore } from "../index.svelte";
import type { FilterCondition, FilterOperator } from "../types";

export type ColumnFilteringState = {
  conditions: FilterCondition<any>[]; // List of filter conditions for columns
  isManual: boolean; // Indicates if filters are applied manually
};

export type ColumnFilteringFeatureConfig = Partial<ColumnFilteringState>;
export type IColumnFilteringFeature = ColumnFilteringFeature;

/**
 * Manages column filtering functionality for a data grid.
 * Provides utilities for evaluating filter conditions and toggling the visibility of filters.
 */
export class ColumnFilteringFeature<TOriginalRow = any> implements IColumnFilteringFeature {
  datagrid: DatagridCore; // Reference to the parent DataGrid

  // Stores all filter conditions for the columns
  filterConditions: FilterCondition<TOriginalRow>[] = $state([]);
  isManual: boolean = $state(false);

  /**
   * Creates an instance of ColumnFilteringFeature.
   * @param datagrid - The DataGrid instance to manage filters for.
   * @param config - Optional configuration to initialize the feature with.
   */
  constructor(datagrid: DatagridCore, config: ColumnFilteringFeatureConfig) {
    this.datagrid = datagrid;
    Object.assign(this, config);
    if (config?.conditions) this.filterConditions = config.conditions;
  }

  /**
   * Retrieves the filter condition value for a given column.
   * @param columnId - The ID of the column to get the filter condition value for.
   * @returns The filter condition value or `null` if no condition exists for the column.
   */
  getConditionValue(fieldId: string): any {
    const condition = this.filterConditions.find((c) => this.getConditionFieldId(c) === fieldId);
    return condition ? condition.value : null;
  }

  /**
   * Retrieves the 'to' value for a range filter condition for a given column.
   * @param columnId - The ID of the column to get the range filter 'to' value for.
   * @returns The 'to' filter condition value or `null` if no condition exists for the column.
   */
  getConditionValueTo(fieldId: string): any {
    const condition = this.filterConditions.find((c) => this.getConditionFieldId(c) === fieldId);
    return condition ? condition.valueTo : null;
  }

  /**
   * Retrieves the filter operator for a given column.
   * @param columnId - The ID of the column to get the filter operator for.
   * @returns The filter operator or `undefined` if no condition exists for the column.
   */
  getConditionOperator(fieldId: string): FilterOperator | undefined {
    const condition = this.filterConditions.find((c) => this.getConditionFieldId(c) === fieldId);
    return condition?.operator;
  }

  /**
   * Updates the filter operator for a given column.
   * If no condition exists, a new one is created.
   * @param columnId - The ID of the column to update the filter operator for.
   * @param operator - The new filter operator to set.
   */
  changeConditionOperator(fieldId: string, operator: FilterOperator) {
    const field = this.datagrid.dataFields.findFieldByIdOrThrow(fieldId);
    if (field.filterable === false) return;

    let condition = this.filterConditions.find((c) => this.getConditionFieldId(c) === fieldId);
    if (!condition) {
      this.filterConditions.push({
        fieldId,
        operator,
        value: null,
        valueTo: undefined,
      });
    }
    condition = this.filterConditions.find((c) => this.getConditionFieldId(c) === fieldId);
    if (!condition) throw new Error(`Condition for field ${fieldId} not found`);
    condition.operator = operator;
  }

  getConditionFieldId(condition: FilterCondition<TOriginalRow>): string {
    return this.datagrid.dataFields.getConditionFieldId(condition);
  }

  /**
   * Evaluates a cell value against a filter condition.
   * @param cellValue - The value of the cell to evaluate.
   * @param condition - The filter condition to evaluate against.
   * @returns `true` if the cell value satisfies the condition, otherwise `false`.
   */
  evaluateCondition(cellValue: any, condition: FilterCondition<TOriginalRow>): boolean {
    const { value, valueTo, operator } = condition;

    // Handle null/undefined cell values
    if (cellValue === null || cellValue === undefined) {
      return operator === "empty";
    }

    // Convert to string for string operations
    const stringCellValue = String(cellValue).toLowerCase();
    const stringValue = String(value).toLowerCase();

    switch (operator) {
      case "equals":
        return cellValue === value;

      case "notEquals":
        return cellValue !== value;

      case "contains":
        return stringCellValue.includes(stringValue);

      case "notContains":
        return !stringCellValue.includes(stringValue);

      case "startsWith":
        return stringCellValue.startsWith(stringValue);

      case "endsWith":
        return stringCellValue.endsWith(stringValue);

      case "greaterThan":
        return cellValue > value;

      case "lessThan":
        return cellValue < value;

      case "greaterThanOrEqual":
        return cellValue >= value;

      case "lessThanOrEqual":
        return cellValue <= value;

      case "between":
        if (valueTo === undefined) throw new Error("Between filter requires a second value");
        return cellValue >= value && cellValue <= valueTo;

      case "inList":
        return Array.isArray(value) && value.includes(cellValue);

      case "notInList":
        return Array.isArray(value) && !value.includes(cellValue);

      case "empty":
        return cellValue === "" || cellValue === null || cellValue === undefined;

      case "notEmpty":
        return cellValue !== "" && cellValue !== null && cellValue !== undefined;

      default:
        // Default behavior: always return true
        return true;
    }
  }
}
