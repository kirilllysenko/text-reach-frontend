import type { CreateUserInput } from "$houdini/graphql/inputs";
import { userRoleOptions } from "$lib/feature/user/user-view-data";
import { PasswordSchema } from "$lib/form/validators";
import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { z } from "zod";

export const validator = z
  .object({
    email: z.string().trim().pipe(z.email("Enter a valid email address")),
    name: z.string().max(50, "Name must be 50 characters or fewer"),
    password: PasswordSchema,
    role: z.enum(userRoleOptions),
  })
  .transform(
    (values): CreateUserInput => ({
      email: values.email,
      name: optionalText(values.name),
      password: values.password,
      role: values.role,
    }),
  );

export type FormValues = z.input<typeof validator>;
export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  email: "",
  name: "",
  password: "",
  role: "EMPLOYEE",
};

export function createAddUserForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}
