import { z } from "zod";
import type { FieldErrors } from "~/lib/form/validation";
import { OTP_LENGTH, PasswordSchema } from "~/lib/form/validators";

export const EmailSchema = z.email();
export const ResetCodeSchema = z
  .string()
  .min(1, "Required")
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `The code must contain exactly ${OTP_LENGTH} digits`);

export const resetPasswordValidator = z.object({
  email: EmailSchema,
  code: ResetCodeSchema,
  newPassword: PasswordSchema,
});

export type ResetPasswordValues = z.infer<typeof resetPasswordValidator>;

export interface ResetPasswordFieldProps {
  values: Pick<ResetPasswordValues, "email" | "code">;
  errors: Pick<FieldErrors<ResetPasswordValues>, "email" | "code">;
  setValue: (field: "email" | "code", value: string) => void;
  setError: (field: "email" | "code", error: string | undefined) => void;
}
