import type { CreateUserInput } from "$houdini/graphql/inputs";
import { userRoleOptions } from "$lib/feature/user/user-view-data";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { PasswordSchema } from "$lib/form/validators";
import { z } from "zod";

export type FormMode = "create" | "edit";

const formValuesSchema = z.object({
  email: z.string(),
  name: z.string().max(50, "Name must be 50 characters or fewer"),
  password: z.string(),
  role: z.enum(userRoleOptions),
});

export type FormValues = z.input<typeof formValuesSchema>;
export type SubmitValues = CreateUserInput;

export const initialValues: FormValues = {
  email: "",
  name: "",
  password: "",
  role: "EMPLOYEE",
};

export function createUserForm(mode: FormMode, onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  const validator = formValuesSchema
    .superRefine((values, context) => {
      if (mode !== "create") {
        return;
      }

      const email = z.email("Enter a valid email address").safeParse(values.email.trim());
      if (!email.success) {
        context.addIssue({
          code: "custom",
          message: email.error.issues[0]?.message ?? "Required",
          path: ["email"],
        });
      }

      const password = PasswordSchema.safeParse(values.password);
      if (!password.success) {
        context.addIssue({
          code: "custom",
          message: password.error.issues[0]?.message ?? "Required",
          path: ["password"],
        });
      }
    })
    .transform(
      (values): SubmitValues => ({
        email: values.email.trim(),
        name: optionalText(values.name),
        password: values.password,
        role: values.role,
      }),
    );

  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}
