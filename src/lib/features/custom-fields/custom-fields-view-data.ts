import type { CustomFieldDto, CustomFieldType, SortDirection } from "$lib/api/index.schemas";

export interface CustomFieldViewModel {
  id: string;
  name: string;
  type: CustomFieldType;
  typeLabel: string;
  position: string;
}

export type CustomFieldSortField = "name" | "type" | "position";

export interface CustomFieldSortRule {
  id: string;
  field: CustomFieldSortField;
  direction: SortDirection;
}

export type CustomFieldDtoLike = Pick<CustomFieldDto, "id" | "name" | "position" | "type">;

export const customFieldTypeOptions: CustomFieldType[] = ["TEXT", "NUMBER", "DATE"];
export const customFieldSortFieldOptions: CustomFieldSortField[] = ["name", "type", "position"];

export const customFieldTypeLabelMap: Record<CustomFieldType, string> = {
  TEXT: "Text",
  NUMBER: "Number",
  DATE: "Date",
};

export const customFieldSortFieldLabelMap: Record<CustomFieldSortField, string> = {
  name: "Name",
  type: "Type",
  position: "Position",
};
