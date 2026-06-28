import { normalizePhoneNumber, OTP_LENGTH, PasswordSchema, PhoneNumberSchema } from "$lib/form/validators";
import { z } from "zod";
import { createForm } from "$lib/form/form.svelte";
import  { signUp, type SignUpResponse } from "$lib/api/tenant/tenant";
import { goto } from "$app/navigation";

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

export const form = createForm<FormValues, SignUpResponse>(initialValues, validator, submit);

async function submit(values: FormValues): Promise<SignUpResponse> {
  const response = await signUp(
    {
      email: values.email,
      emailCode: values.emailCode,
      phoneNumber: normalizePhoneNumber(values.phoneNumber),
      phoneNumberCode: values.phoneNumberCode,
      password: values.password,
    },
    { credentials: "include" },
  );

  if (response.status === 200) {
    await goto("/sign-in?signUpOk=1");
  }

  return response;
}
