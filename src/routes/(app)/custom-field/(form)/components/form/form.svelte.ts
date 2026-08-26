import type { CustomFieldWriteInput } from "$houdini/graphql/inputs";
import {
  customFieldTypeLabelMap,
  customFieldTypeOptions,
  type CustomFieldType,
} from "$lib/feature/custom-field/custom-field-view-data";
import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { z } from "zod";

export interface TypeOption {
  id: CustomFieldType;
  value: string;
}

export const typeOptions = customFieldTypeOptions.map((type) => ({
  id: type,
  value: customFieldTypeLabelMap[type],
})) satisfies TypeOption[];

export const validator = z
  .object({
    name: z.string().trim().min(1, "Required"),
    type: z.custom<CustomFieldType>((value) => customFieldTypeOptions.includes(value as CustomFieldType)),
  })
  .transform(
    (values): CustomFieldWriteInput => ({
      fieldType: values.type,
      name: values.name,
    }),
  );

export type FormValues = z.input<typeof validator>;
export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  name: "",
  type: typeOptions[0].id,
};

export function createCustomFieldForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

export function getTypeOption(type: CustomFieldType): TypeOption {
  return typeOptions.find((option) => option.id === type) ?? typeOptions[0];
}
