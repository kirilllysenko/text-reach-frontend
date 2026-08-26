import type { TenDlcBrandInput } from "$houdini/graphql/inputs";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { z } from "zod";

export const validator = z
  .object({ name: z.string().trim().min(1, "Required").max(255, "Too long") })
  .transform((values): TenDlcBrandInput => values);

export type SubmitValues = z.output<typeof validator>;

export function createTenDlcBrandForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm({ name: "" }, validator, onSubmit);
}
