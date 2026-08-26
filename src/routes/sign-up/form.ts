import { z } from "zod";
import type { FieldErrors } from "~/lib/form/validation";
import { normalizePhoneNumber, OTP_LENGTH, PasswordSchema, PhoneNumberSchema } from "~/lib/form/validators";

export const EmailSchema = z.email();
export const ConfirmationCodeSchema = z
  .string()
  .min(1, "Required")
  .length(OTP_LENGTH, `The code must contain exactly ${OTP_LENGTH} digits`);

export const signUpValidator = z.object({
  email: EmailSchema,
  emailCode: ConfirmationCodeSchema,
  phoneNumber: PhoneNumberSchema,
  phoneNumberCode: ConfirmationCodeSchema,
  password: PasswordSchema,
});

export type SignUpValues = z.infer<typeof signUpValidator>;

export interface SignUpFieldProps<K extends keyof SignUpValues> {
  values: Pick<SignUpValues, K>;
  errors: Pick<FieldErrors<SignUpValues>, K>;
  setValue: (field: K, value: string) => void;
  setError: (field: K, error: string | undefined) => void;
}

export function signUpInput(values: SignUpValues) {
  return {
    email: values.email,
    emailCode: values.emailCode,
    phoneNumber: normalizePhoneNumber(values.phoneNumber),
    phoneNumberCode: values.phoneNumberCode,
    password: values.password,
  };
}
