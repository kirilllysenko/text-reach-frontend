import type { CustomFieldType$options, SortDirection$options } from "$houdini/graphql/enums";

export type CustomFieldType = CustomFieldType$options;

export interface CustomFieldViewModel {
  id: string;
  name: string;
  type: CustomFieldType;
  typeLabel: string;
}

export type CustomFieldSortField = "name" | "type";

export interface CustomFieldSortRule {
  id: string;
  field: CustomFieldSortField;
  direction: SortDirection$options;
}

export interface CustomFieldDtoLike {
  id: string;
  name: string;
  type: CustomFieldType;
}

export const customFieldTypeOptions: CustomFieldType[] = ["TEXT", "NUMBER", "DATE"];
export const customFieldSortFieldOptions: CustomFieldSortField[] = ["name", "type"];

export const customFieldTypeLabelMap: Record<CustomFieldType, string> = {
  TEXT: "Text",
  NUMBER: "Number",
  DATE: "Date",
};

export const customFieldSortFieldLabelMap: Record<CustomFieldSortField, string> = {
  name: "Name",
  type: "Type",
};
