import type { UpdateUserInput } from "$houdini/graphql/inputs";
import { userRoleOptions } from "$lib/feature/user/user-view-data";
import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { z } from "zod";

export type SubmitValues = Omit<UpdateUserInput, "id">;

export const validator = z
  .object({
    email: z.string(),
    name: z.string().max(50, "Name must be 50 characters or fewer"),
    role: z.enum(userRoleOptions),
  })
  .transform(
    (values): SubmitValues => ({
      name: optionalText(values.name),
      role: values.role,
    }),
  );

export type FormValues = z.input<typeof validator>;

export const initialValues: FormValues = {
  email: "",
  name: "",
  role: "EMPLOYEE",
};

export function createEditUserForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}
