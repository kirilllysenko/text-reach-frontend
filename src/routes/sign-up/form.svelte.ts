import { normalizePhoneNumber, OTP_LENGTH, PasswordSchema, PhoneNumberSchema } from "$lib/form/validators";
import { z } from "zod";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { goto } from "$app/navigation";
import { SignUpStore } from "$houdini";
import { networkErrorText } from "$lib/form/errors";
import { toGraphQLErrorText } from "$lib/graphql/errors";

export const EmailSchema = z.email();

export const ConfirmationCodeSchema = z
  .string()
  .min(1, "Required")
  .length(OTP_LENGTH, `The code must contain exactly ${OTP_LENGTH} digits`);

export const validator = z.object({
  email: EmailSchema,
  emailCode: ConfirmationCodeSchema,
  phoneNumber: PhoneNumberSchema,
  phoneNumberCode: ConfirmationCodeSchema,
  password: PasswordSchema,
});

export type FormValues = z.infer<typeof validator>;

export const initialValues: FormValues = {
  email: "",
  emailCode: "",
  phoneNumber: "",
  phoneNumberCode: "",
  password: "",
};

const signUpMutation = new SignUpStore();

export const form = createForm(initialValues, validator, submit);

async function submit(values: FormValues): Promise<FormSubmitResult> {
  try {
    const response = await signUpMutation.mutate({
      input: {
        email: values.email,
        emailCode: values.emailCode,
        phoneNumber: normalizePhoneNumber(values.phoneNumber),
        phoneNumberCode: values.phoneNumberCode,
        password: values.password,
      },
    });

    if (!response.errors && response.data?.signUp) {
      await goto("/sign-in?signUpOk=1");
      return {};
    }

    return formError(toGraphQLErrorText(response.errors));
  } catch {
    return formError(networkErrorText);
  }
}

function formError(error: string): FormSubmitResult {
  return { error };
}
