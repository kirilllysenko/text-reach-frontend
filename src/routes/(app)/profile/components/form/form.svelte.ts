import { PasswordSchema } from "$lib/form/validators";
import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { z } from "zod";

export const profileNameValidator = z
  .object({
    name: z.string().trim().max(50, "Too long"),
  })
  .transform((values) => ({ name: values.name || null }));

export type ProfileNameFormValues = z.input<typeof profileNameValidator>;
export type ProfileNameSubmitValues = z.output<typeof profileNameValidator>;

export function createProfileNameForm(
  name: string,
  onSubmit: (values: ProfileNameSubmitValues) => Promise<FormSubmitResult>,
) {
  const initialValues: ProfileNameFormValues = { name };
  return createForm<ProfileNameFormValues, ProfileNameSubmitValues>(initialValues, profileNameValidator, onSubmit);
}

export const profilePasswordValidator = z.object({
  oldPassword: PasswordSchema,
  newPassword: PasswordSchema,
});

export type ProfilePasswordFormValues = z.input<typeof profilePasswordValidator>;
export type ProfilePasswordSubmitValues = z.output<typeof profilePasswordValidator>;

export const initialPasswordValues: ProfilePasswordFormValues = {
  oldPassword: "",
  newPassword: "",
};

export function createProfilePasswordForm(
  onSubmit: (values: ProfilePasswordSubmitValues) => Promise<FormSubmitResult>,
) {
  return createForm(initialPasswordValues, profilePasswordValidator, onSubmit);
}
