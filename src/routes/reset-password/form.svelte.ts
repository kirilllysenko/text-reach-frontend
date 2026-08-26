import { goto } from "$app/navigation";
import { ResetPasswordStore } from "$houdini";
import { PATH_SIGN_IN } from "$lib/app/paths";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { defaultErrorText, networkErrorText } from "$lib/form/errors";
import { OTP_LENGTH, PasswordSchema } from "$lib/form/validators";
import { graphQLErrorCode } from "$lib/graphql/errors";
import { z } from "zod";

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

const resetPasswordMutation = new ResetPasswordStore();

export const form = createForm(initialValues, validator, submit);

async function submit(values: FormValues): Promise<FormSubmitResult> {
  try {
    const response = await resetPasswordMutation.mutate({ input: values });

    if (!response.errors && response.data?.resetPassword) {
      await goto(`${PATH_SIGN_IN}?resetPasswordOk=1`);
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
}
