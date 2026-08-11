import type { Component } from "svelte";
import type {
  DataTableComparisonFilterComponentProps,
  DataTableComparisonFilterDefinition,
  DataTableComparisonOperator,
  DataTableContainmentFilterComponentProps,
  DataTableContainmentFilterDefinition,
  DataTableContainmentOperator,
  DataTableFilter,
  DataTableFilterValue,
  DataTableTextFilterComponentProps,
  DataTableTextFilterDefinition,
  DataTableTextOperator,
} from "./column-filtering.svelte";

type Defined<TValue> = Exclude<TValue, null | undefined>;
type BackendFilterField<TFilter extends object> = Exclude<keyof TFilter, "nested" | "operator"> & string;

type OperatorKey<TOperator extends DataTableFilter["operator"]> = TOperator extends DataTableTextOperator
  ? TextOperatorKey<TOperator>
  : TOperator extends DataTableComparisonOperator
    ? ComparisonOperatorKey<TOperator>
    : TOperator extends DataTableContainmentOperator
      ? ContainmentOperatorKey<TOperator>
      : never;

type TextOperatorKey<TOperator extends DataTableTextOperator> = {
  CONTAINS: "contains";
  ENDS_WITH: "endsWith";
  EQUAL: "equal";
  NOT_CONTAINS: "notContains";
  NOT_EQUAL: "notEqual";
  STARTS_WITH: "startsWith";
}[TOperator];

type ComparisonOperatorKey<TOperator extends DataTableComparisonOperator> = {
  EQUAL: "equal";
  GREATER_OR_EQUAL: "greaterOrEqual";
  GREATER_THAN: "greaterThan";
  LESS_OR_EQUAL: "lessOrEqual";
  LESS_THAN: "lessThan";
  NOT_EQUAL: "notEqual";
}[TOperator];

type ContainmentOperatorKey<TOperator extends DataTableContainmentOperator> = {
  IN: "in";
  NOT_IN: "notIn";
}[TOperator];

type FieldsWithOperator<TFilter extends object, TOperator extends DataTableFilter["operator"]> = {
  [TField in BackendFilterField<TFilter>]: OperatorKey<TOperator> extends keyof Defined<TFilter[TField]>
    ? TField
    : never;
}[BackendFilterField<TFilter>];

type BackendOperatorValue<
  TFilter extends object,
  TField extends BackendFilterField<TFilter>,
  TOperator extends DataTableFilter["operator"],
> =
  OperatorKey<TOperator> extends keyof Defined<TFilter[TField]>
    ? Defined<Defined<TFilter[TField]>[OperatorKey<TOperator>]>
    : never;

type ScalarTextField<TFilter extends object> = {
  [TField in BackendFilterField<TFilter>]: Defined<TFilter[TField]> extends string ? TField : never;
}[BackendFilterField<TFilter>];

interface BackendValueTransform<TControlValue, TBackendValue> {
  fromBackend?: (value: TBackendValue) => TControlValue;
  toBackend?: (value: TControlValue) => TBackendValue | undefined;
}

interface BackendDefinitionBase<
  TFilter extends object,
  TFilterId extends string,
  TField extends BackendFilterField<TFilter>,
  TControlValue,
  TBackendValue,
> {
  field: TField;
  filterId: TFilterId;
  formatValue?: (value: DataTableFilterValue, filter: TFilter) => string;
  hidden?: boolean;
  label: string;
  value?: BackendValueTransform<TControlValue, TBackendValue>;
}

type BackendTextDefinitionInput<
  TFilter extends object,
  TFilterId extends string,
  TOperator extends DataTableTextOperator,
  TField extends FieldsWithOperator<TFilter, TOperator>,
> = BackendDefinitionBase<TFilter, TFilterId, TField, string, BackendOperatorValue<TFilter, TField, TOperator>> & {
  component?: Component<DataTableTextFilterComponentProps>;
  defaultOperator: TOperator;
};

type BackendComparisonDefinitionInput<
  TFilter extends object,
  TFilterId extends string,
  TOperator extends DataTableComparisonOperator,
  TField extends FieldsWithOperator<TFilter, TOperator>,
> = BackendDefinitionBase<
  TFilter,
  TFilterId,
  TField,
  string | number,
  BackendOperatorValue<TFilter, TField, TOperator>
> & {
  component?: Component<DataTableComparisonFilterComponentProps>;
  defaultOperator: TOperator;
};

type BackendContainmentDefinitionInput<
  TFilter extends object,
  TFilterId extends string,
  TOperator extends DataTableContainmentOperator,
  TField extends FieldsWithOperator<TFilter, TOperator>,
> = BackendDefinitionBase<TFilter, TFilterId, TField, string[], BackendOperatorValue<TFilter, TField, TOperator>> & {
  component?: Component<DataTableContainmentFilterComponentProps>;
  defaultOperator: TOperator;
};

type BackendScalarTextDefinitionInput<
  TFilter extends object,
  TFilterId extends string,
  TField extends ScalarTextField<TFilter>,
> = BackendDefinitionBase<TFilter, TFilterId, TField, string, Defined<TFilter[TField]>> & {
  defaultOperator?: DataTableTextOperator;
};

export function backendFilterDefinition<TFilter extends object>() {
  return {
    comparison<
      const TFilterId extends string,
      const TOperator extends DataTableComparisonOperator,
      const TField extends FieldsWithOperator<TFilter, TOperator>,
    >(
      definition: BackendComparisonDefinitionInput<TFilter, TFilterId, TOperator, TField>,
    ): DataTableComparisonFilterDefinition<TFilterId, any, TFilter> {
      return createConditionDefinition(definition, "comparison");
    },
    containment<
      const TFilterId extends string,
      const TOperator extends DataTableContainmentOperator,
      const TField extends FieldsWithOperator<TFilter, TOperator>,
    >(
      definition: BackendContainmentDefinitionInput<TFilter, TFilterId, TOperator, TField>,
    ): DataTableContainmentFilterDefinition<TFilterId, any, TFilter> {
      return createConditionDefinition(definition, "containment");
    },
    text<
      const TFilterId extends string,
      const TOperator extends DataTableTextOperator,
      const TField extends FieldsWithOperator<TFilter, TOperator>,
    >(
      definition: BackendTextDefinitionInput<TFilter, TFilterId, TOperator, TField>,
    ): DataTableTextFilterDefinition<TFilterId, any, TFilter> {
      return createConditionDefinition(definition, "text");
    },
    value<const TFilterId extends string, const TField extends ScalarTextField<TFilter>>(
      definition: BackendScalarTextDefinitionInput<TFilter, TFilterId, TField>,
    ): DataTableTextFilterDefinition<TFilterId, any, TFilter> {
      const defaultOperator = definition.defaultOperator ?? "CONTAINS";

      return {
        ...definition,
        createFilter: (value, operator) => {
          assertOperator(definition.filterId, defaultOperator, operator);
          const normalizedValue = normalizeValue(value, "text");
          if (typeof normalizedValue === "undefined") {
            return null;
          }

          const backendValue = definition.value?.toBackend
            ? definition.value.toBackend(normalizedValue as string)
            : normalizedValue;
          return typeof backendValue === "undefined" ? null : ({ [definition.field]: backendValue } as TFilter);
        },
        defaultOperator,
        fieldId: definition.field,
        getOperator: () => defaultOperator,
        getValue: (filter) => {
          const backendValue = filter[definition.field] as Defined<TFilter[TField]>;
          return definition.value?.fromBackend ? definition.value.fromBackend(backendValue) : (backendValue as string);
        },
        isFilter: (filter) => filter[definition.field] != null,
        type: "text",
      };
    },
  };
}

function createConditionDefinition<
  TFilter extends object,
  TFilterId extends string,
  TOperator extends DataTableFilter["operator"],
  TField extends FieldsWithOperator<TFilter, TOperator>,
>(
  definition: BackendDefinitionBase<
    TFilter,
    TFilterId,
    TField,
    any,
    BackendOperatorValue<TFilter, TField, TOperator>
  > & {
    component?: Component<any>;
    defaultOperator: TOperator;
  },
  type: DataTableFilter["type"],
): any {
  const operatorKey = toOperatorKey(definition.defaultOperator);

  return {
    ...definition,
    createFilter: (value: DataTableFilterValue, operator: DataTableFilter["operator"]) => {
      assertOperator(definition.filterId, definition.defaultOperator, operator);
      const normalizedValue = normalizeValue(value, type);
      if (typeof normalizedValue === "undefined") {
        return null;
      }

      const backendValue = definition.value?.toBackend ? definition.value.toBackend(normalizedValue) : normalizedValue;
      return typeof backendValue === "undefined"
        ? null
        : ({ [definition.field]: { [operatorKey]: backendValue } } as TFilter);
    },
    fieldId: definition.field,
    getOperator: () => definition.defaultOperator,
    getValue: (filter: TFilter) => {
      const condition = filter[definition.field] as Record<string, unknown>;
      const backendValue = condition[operatorKey] as BackendOperatorValue<TFilter, TField, TOperator>;
      return definition.value?.fromBackend ? definition.value.fromBackend(backendValue) : backendValue;
    },
    isFilter: (filter: TFilter) => {
      const condition = filter[definition.field];
      return typeof condition === "object" && condition !== null && operatorKey in condition;
    },
    type,
  };
}

function assertOperator(
  filterId: string,
  expected: DataTableFilter["operator"],
  actual: DataTableFilter["operator"],
): void {
  if (expected !== actual) {
    throw new Error(`Filter ${filterId} requires operator ${expected}`);
  }
}

function normalizeValue(value: DataTableFilterValue, type: DataTableFilter["type"]): DataTableFilterValue | undefined {
  if (type === "text") {
    const normalizedValue = typeof value === "string" ? value.trim() : "";
    return normalizedValue || undefined;
  }

  if (type === "containment") {
    return Array.isArray(value) && value.length > 0 ? value : undefined;
  }

  return typeof value === "undefined" || value === "" || value === null ? undefined : value;
}

function toOperatorKey(operator: DataTableFilter["operator"]): string {
  const keys: Record<DataTableFilter["operator"], string> = {
    CONTAINS: "contains",
    ENDS_WITH: "endsWith",
    EQUAL: "equal",
    GREATER_OR_EQUAL: "greaterOrEqual",
    GREATER_THAN: "greaterThan",
    IN: "in",
    LESS_OR_EQUAL: "lessOrEqual",
    LESS_THAN: "lessThan",
    NOT_CONTAINS: "notContains",
    NOT_EQUAL: "notEqual",
    NOT_IN: "notIn",
    STARTS_WITH: "startsWith",
  };

  return keys[operator];
}
