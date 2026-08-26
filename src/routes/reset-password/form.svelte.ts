import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { ResetPasswordStore } from "$houdini";
import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { defaultErrorText, networkErrorText } from "$lib/form/errors";
import { OTP_LENGTH, PasswordSchema } from "$lib/form/validators";
import { graphQLErrorCode } from "$lib/graphql/errors";
import { z } from "zod";
import { createContext } from "svelte";

export const EmailSchema = z.email();

export const ResetCodeSchema = z
  .string()
  .min(1, "Required")
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `The code must contain exactly ${OTP_LENGTH} digits`);

export const validator = z.object({
  email: EmailSchema,
  code: ResetCodeSchema,
  newPassword: PasswordSchema,
});

export type FormValues = z.infer<typeof validator>;

export const initialValues: FormValues = {
  email: "",
  code: "",
  newPassword: "",
};

export function createResetPasswordForm() {
  const resetPasswordMutation = new ResetPasswordStore();

  return createForm(initialValues, validator, async (values): Promise<FormSubmitResult> => {
    try {
      const response = await resetPasswordMutation.mutate({ input: values });

      if (!response.errors && response.data?.resetPassword) {
        await goto(resolve("/sign-in?resetPasswordOk=1"));
        return {};
      }

      const code = graphQLErrorCode(response.errors);
      if (code === "INVALID_VALUE" || code === "NOT_FOUND") {
        return { error: "The reset code is invalid or has expired." };
      }

      return { error: defaultErrorText };
    } catch {
      return { error: networkErrorText };
    }
  });
}

export type ResetPasswordForm = ReturnType<typeof createResetPasswordForm>;
export const [getResetPasswordForm, setResetPasswordForm] = createContext<ResetPasswordForm>();
