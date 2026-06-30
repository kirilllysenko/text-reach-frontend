import { goto } from "$app/navigation";
import { checkSession, signIn, type SignInResponse } from "$lib/api/auth/auth";
import { PATH_DASHBOARD } from "$lib/app/paths";
import { createForm } from "$lib/form/form.svelte";
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

export const form = createForm<FormValues, SignInResponse>(initialValues, validator, submit);

export async function redirectActiveSession(): Promise<void> {
  const response = await checkSession({ credentials: "include" });
  if (response.status === 200) {
    await goto(PATH_DASHBOARD);
  }
}

async function submit(values: FormValues): Promise<SignInResponse> {
  const response = await signIn(values, { credentials: "include" });

  if (response.status === 200) {
    await goto(PATH_DASHBOARD);
  }

  return response;
}
