import type { SortDirection$options } from "$houdini/graphql/enums";
import type { SortFieldInput } from "$houdini/graphql/inputs";
import type { DataTableActiveSortDirection, DataTableSortDefinitionWithDefault } from "./sorting.svelte";

export type SortField<TSort extends object> = {
  [TField in keyof TSort & string]-?: NonNullable<TSort[TField]> extends SortFieldInput ? TField : never;
}[keyof TSort & string];

interface BackendSortDefinitionInput<TSort extends object, TField extends SortField<TSort>> {
  defaultDirection?: SortDirection$options;
  field: TField;
  label: string;
}

export type SortDefinition<TSort extends object> = DataTableSortDefinitionWithDefault<string, any, TSort>;

export function backendSortDefinition<TSort extends object>() {
  return <const TField extends SortField<TSort>>(
    definition: BackendSortDefinitionInput<TSort, TField>,
  ): SortDefinition<TSort> => ({
    createSort: (direction) =>
      ({
        [definition.field]: {
          direction: toBackendDirection(direction),
        },
      }) as TSort,
    defaultDirection: toTableDirection(definition.defaultDirection ?? "ASC"),
    fieldId: definition.field,
    getDirection: (sort) => {
      const field = sort[definition.field] as SortFieldInput | null | undefined;
      return toTableDirection(field?.direction ?? "ASC");
    },
    isSort: (sort) => sort[definition.field] != null,
    label: definition.label,
    sortId: definition.field,
  });
}

function toTableDirection(direction: SortDirection$options): DataTableActiveSortDirection {
  return direction === "DESC" ? "descending" : "ascending";
}

function toBackendDirection(direction: DataTableActiveSortDirection): SortDirection$options {
  return direction === "descending" ? "DESC" : "ASC";
}
