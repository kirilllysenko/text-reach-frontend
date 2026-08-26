import type { CustomFieldType } from "~/gql/graphql";

export const customFieldTypeOptions: CustomFieldType[] = ["TEXT", "NUMBER", "DATE"];
export const customFieldTypeLabelMap: Record<CustomFieldType, string> = {
  TEXT: "Text",
  NUMBER: "Number",
  DATE: "Date",
};
