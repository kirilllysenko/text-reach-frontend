import type { CustomFieldType$options } from "$houdini/graphql/enums";

export type CustomFieldType = CustomFieldType$options;

export const customFieldTypeOptions: CustomFieldType[] = ["TEXT", "NUMBER", "DATE"];

export const customFieldTypeLabelMap: Record<CustomFieldType, string> = {
  TEXT: "Text",
  NUMBER: "Number",
  DATE: "Date",
};
