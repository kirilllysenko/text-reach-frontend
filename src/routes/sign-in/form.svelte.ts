import { PasswordSchema } from "$lib/form/validators";
import { z } from "zod";

export const validator = z.object({
  email: z.email(),
  password: PasswordSchema,
});

export type FormValues = z.infer<typeof validator>;

export const initialValues: FormValues = {
  email: "",
  password: "",
};
