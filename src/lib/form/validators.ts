import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 50;
export const OTP_LENGTH = 6;

export function normalizePhoneNumber(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

const phoneNumberError = "A valid phone number is required";

const passwordComplexityError = `The password must contain lowercase, uppercase letters and digits, and be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long`;

export const PhoneNumberSchema = z
  .string()
  .min(1, "Required")
  .refine((value) => normalizePhoneNumber(value).length === 10, {
    message: phoneNumberError,
  });

export const PasswordSchema = z
  .string()
  .min(1, "Required")
  .refine((value) => value === value.trim(), {
    message: "The password must not begin or end with spaces",
  })
  .refine(
    (value) =>
      value.length >= MIN_PASSWORD_LENGTH &&
      value.length <= MAX_PASSWORD_LENGTH &&
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value),
    {
      message: passwordComplexityError,
    },
  );
