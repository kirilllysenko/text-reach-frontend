import type { ContactWriteInput } from "$houdini/graphql/inputs";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { z } from "zod";

export const validator = z
  .object({
    birthday: z.string(),
    contactGroupIds: z.array(z.ulid()),
    customFields: z.record(z.string(), z.string()),
    email: z
      .string()
      .trim()
      .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address"),
    firstName: z.string(),
    lastName: z.string(),
    notes: z.string(),
    phoneNumber: z.string().trim().min(1, "Required"),
  })
  .transform(
    (values): ContactWriteInput => ({
      birthday: optionalText(values.birthday),
      contactGroupIds: values.contactGroupIds,
      customFields: Object.entries(values.customFields).map(([id, value]) => ({ id, value: value.trim() })),
      email: optionalText(values.email),
      firstName: optionalText(values.firstName),
      lastName: optionalText(values.lastName),
      notes: optionalText(values.notes),
      phoneNumber: values.phoneNumber,
    }),
  );

export type FormValues = z.input<typeof validator>;
export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  birthday: "",
  contactGroupIds: [],
  customFields: {},
  email: "",
  firstName: "",
  lastName: "",
  notes: "",
  phoneNumber: "",
};

export function createContactForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}
