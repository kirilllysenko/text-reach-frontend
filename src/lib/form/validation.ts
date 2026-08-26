import type { z } from "zod";

export type FieldErrors<T extends object> = Partial<Record<keyof T, string>>;

export function validateFields<T extends object>(schema: z.ZodType<T>, values: T): FieldErrors<T> {
  const result = schema.safeParse(values);
  if (result.success) return {};

  const errors: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in errors)) {
      errors[field as keyof T] = issue.message;
    }
  }
  return errors;
}
