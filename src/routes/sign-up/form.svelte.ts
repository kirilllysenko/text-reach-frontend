import { normalizePhoneNumber, OTP_LENGTH, PasswordSchema, PhoneNumberSchema } from "$lib/form/validators";
import { z } from "zod";
import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { SignUpStore } from "$houdini";
import { networkErrorText } from "$lib/form/errors";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import { createContext } from "svelte";

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

export function createSignUpForm() {
  const signUpMutation = new SignUpStore();

  return createForm(initialValues, validator, async (values): Promise<FormSubmitResult> => {
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
        await goto(resolve("/sign-in?signUpOk=1"));
        return {};
      }

      return formError(toGraphQLErrorText(response.errors));
    } catch {
      return formError(networkErrorText);
    }
  });
}

export type SignUpForm = ReturnType<typeof createSignUpForm>;
export const [getSignUpForm, setSignUpForm] = createContext<SignUpForm>();

function formError(error: string): FormSubmitResult {
  return { error };
}
