import { normalizePhoneNumber, OTP_LENGTH, PasswordSchema, PhoneNumberSchema } from "$lib/form/validators";
import { z } from "zod";
import { createForm } from "$lib/form/form.svelte";
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

type SubmitResponse = Record<string, never> | { data: { errorDescription: string }; status: 0 };

const signUpMutation = new SignUpStore();

export const form = createForm<FormValues, SubmitResponse>(initialValues, validator, submit);

async function submit(values: FormValues): Promise<SubmitResponse> {
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

function formError(errorDescription: string): SubmitResponse {
  return { data: { errorDescription }, status: 0 };
}
