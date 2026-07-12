import type { CustomFieldDto, CustomFieldType } from "$lib/api/index.schemas";
import { sortDefinition, type DataTableSortFromDefinitions } from "$lib/components/table";

export interface CustomFieldViewModel {
  id: string;
  name: string;
  type: CustomFieldType;
  typeLabel: string;
}

export type CustomFieldDtoLike = Pick<CustomFieldDto, "id" | "name" | "type">;

export const customFieldTypeOptions: CustomFieldType[] = ["TEXT", "NUMBER", "DATE"];

export const customFieldTypeLabelMap: Record<CustomFieldType, string> = {
  TEXT: "Text",
  NUMBER: "Number",
  DATE: "Date",
};

export const customFieldSortDefinitions = [
  sortDefinition({ sortId: "name", label: "Name" }),
  sortDefinition({ sortId: "type", label: "Type" }),
] as const;

export type CustomFieldTableSort = DataTableSortFromDefinitions<typeof customFieldSortDefinitions>;

export const defaultCustomFieldSorts = [
  {
    direction: customFieldSortDefinitions[0].defaultDirection,
    sortId: customFieldSortDefinitions[0].sortId,
  },
] satisfies CustomFieldTableSort[];
