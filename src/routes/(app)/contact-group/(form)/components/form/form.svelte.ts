import type { ContactGroupWriteInput } from "$houdini/graphql/inputs";
import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { z } from "zod";

export const validator = z
  .object({
    name: z.string().trim().min(1, "Required"),
  })
  .transform(
    (values): ContactGroupWriteInput => ({
      name: values.name,
    }),
  );

export type FormValues = z.input<typeof validator>;
export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  name: "",
};

export function createContactGroupForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}
