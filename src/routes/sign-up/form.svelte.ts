import { OTP_LENGTH, PasswordSchema, PhoneNumberSchema } from "$lib/form/validators";
import { z } from "zod";

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
