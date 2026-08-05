import { goto } from "$app/navigation";
import { CheckSessionStore, SignInStore } from "$houdini";
import { PATH_DASHBOARD } from "$lib/app/paths";
import { createForm } from "$lib/form/form.svelte";
import { networkErrorText } from "$lib/form/errors";
import { PasswordSchema } from "$lib/form/validators";
import { toGraphQLErrorText } from "$lib/graphql/errors";
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

type SubmitResponse = Record<string, never> | { data: { errorDescription: string }; status: 0 };

const checkSessionQuery = new CheckSessionStore();
const signInMutation = new SignInStore();

export const form = createForm<FormValues, SubmitResponse>(initialValues, validator, submit);

export async function redirectActiveSession(): Promise<void> {
  const response = await checkSessionQuery.fetch();
  if (!response.errors && response.data?.checkSession) {
    await goto(PATH_DASHBOARD);
  }
}

async function submit(values: FormValues): Promise<SubmitResponse> {
  try {
    const response = await signInMutation.mutate({ input: values });

    if (!response.errors && response.data?.signIn) {
      await goto(PATH_DASHBOARD);
      return {};
    }

    return formError(toGraphQLErrorText(response.errors));
  } catch {
    return formError(networkErrorText);
  }
}

function formError(errorDescription: string): SubmitResponse {
  return { data: { errorDescription }, status: 0 };
}
