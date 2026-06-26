import type { FilterOperator, LeafColumn } from "../types";
import { BaseService } from "./base-service";

/**
 * Service for handling filtering functionality in the data grid.
 * This service allows changing filter operators and updating filter conditions for columns.
 *
 * @extends BaseService
 */
export class FilteringService extends BaseService {
  /**
   * Changes the filter operator for a given column and triggers a full data transformation.
   * This will invalidate the cached filtered data and recalculate the filtered view.
   *
   * @param {string} columnId The ID of the column whose filter operator is being changed.
   * @param {FilterOperator} operator The new operator to be applied to the filter condition.
   */
  changeFilterOperator(columnId: string, operator: FilterOperator) {
    this.changeFieldFilterOperator(columnId, operator);
  }

  /**
   * Changes the filter operator for a data field and triggers a full data transformation.
   *
   * @param {string} fieldId The ID of the field whose filter operator is being changed.
   * @param {FilterOperator} operator The new operator to be applied to the filter condition.
   */
  changeFieldFilterOperator(fieldId: string, operator: FilterOperator) {
    this.datagrid.features.filtering.changeConditionOperator(fieldId, operator);
    this.datagrid.cacheManager.invalidate("filteredData");
    this.datagrid.processors.data.executeFullDataTransformation();
  }

  /**
   * Updates the filter condition for a given column. If the column already has a filter condition,
   * it updates the existing condition; otherwise, it adds a new filter condition.
   * This will trigger the filter change event, invalidate cached filtered data, and refresh pagination.
   *
   * @param {Object} props The filter condition properties.
   * @param {LeafColumn<any>} props.column The column to which the filter condition applies.
   * @param {any} props.value The value for the filter condition.
   * @param {any} [props.valueTo] The second value for range-based filters (e.g., 'between' filters).
   * @param {FilterOperator} props.operator The operator to use in the filter condition (e.g., 'equals', 'between').
   *
   * @emits onFilterChange The event emitted when the filter condition changes.
   */
  updateFilterCondition(props: {
    column: LeafColumn<any>;
    value: any;
    valueTo?: any; // Optional second value for range-based filters like 'between'
    operator: FilterOperator; // Add operator to the props
  }) {
    this.datagrid.events.emit("onFilterChange", { column: props.column });

    this.updateFieldFilterCondition({
      fieldId: props.column.columnId,
      value: props.value,
      valueTo: props.valueTo,
      operator: props.operator,
      emitChange: false,
    });
  }

  /**
   * Updates the filter condition for a data field, including fields that do not have rendered columns.
   *
   * @param {Object} props The filter condition properties.
   * @param {string} props.fieldId The field to filter.
   * @param {any} props.value The value for the filter condition.
   * @param {any} [props.valueTo] The second value for range-based filters.
   * @param {FilterOperator} props.operator The operator to use in the filter condition.
   */
  updateFieldFilterCondition(props: {
    fieldId: string;
    value: any;
    valueTo?: any;
    operator: FilterOperator;
    emitChange?: boolean;
  }) {
    if (props.emitChange !== false) {
      this.datagrid.events.emit("onFilterChange", { fieldId: props.fieldId });
    }

    const { fieldId, value, operator, valueTo } = props;
    const field = this.datagrid.dataFields.findFieldByIdOrThrow(fieldId);

    if (field.filterable === false) return;

    const conditionIndex = this.datagrid.features.filtering.filterConditions.findIndex(
      (condition) => this.datagrid.features.filtering.getConditionFieldId(condition) === fieldId,
    );

    if (conditionIndex === -1) {
      // If condition doesn't exist, add a new one
      this.datagrid.features.filtering.filterConditions.push({
        fieldId,
        operator, // Set the operator here
        value,
        valueTo, // Add the second value for 'between' filter
      });
    } else {
      // Update existing condition with the new value and operator
      const condition = this.datagrid.features.filtering.filterConditions[conditionIndex];
      if (condition) {
        condition.value = value;
        condition.operator = operator;
        if (valueTo !== undefined) {
          condition.valueTo = valueTo;
        }
      }
    }

    this.datagrid.cacheManager.invalidate("filteredData");
    this.datagrid.features.pagination.goToFirstPage();
    this.datagrid.processors.data.executeFullDataTransformation();
  }
}
