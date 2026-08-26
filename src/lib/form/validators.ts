import { z } from "zod";

const minPasswordLength = 8;
const maxPasswordLength = 50;
export const OTP_LENGTH = 6;

export function normalizePhoneNumber(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

export const PhoneNumberSchema = z
  .string()
  .min(1, "Required")
  .refine((value) => normalizePhoneNumber(value).length === 10, {
    message: "A valid phone number is required",
  });

export const PasswordSchema = z
  .string()
  .min(1, "Required")
  .refine((value) => value === value.trim(), {
    message: "The password must not begin or end with spaces",
  })
  .refine(
    (value) =>
      value.length >= minPasswordLength &&
      value.length <= maxPasswordLength &&
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value),
    {
      message: `The password must contain lowercase, uppercase letters and digits, and be between
        ${minPasswordLength} and ${maxPasswordLength} characters long`,
    },
  );
