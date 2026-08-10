import { createForm } from "$lib/form/form.svelte";
import { z } from "zod";

export const validator = z.object({
  birthday: z.string().trim(),
  contactGroupIds: z.array(z.ulid()),
  customFields: z.record(z.string(), z.string().trim()),
  email: z.email().trim(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  notes: z.string().trim(),
  phoneNumber: z.string().trim().min(1, "Required"),
});

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

export function createContactForm(onSubmit: (values: SubmitValues) => Promise<void>) {
  return createForm<FormValues, void, SubmitValues>(initialValues, validator, onSubmit);
}
