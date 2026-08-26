import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { SignInSessionQueryStore, SignInStore } from "$houdini";
import { PATH_DASHBOARD } from "$lib/app/paths";
import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { networkErrorText } from "$lib/form/errors";
import { accessFailurePath } from "$lib/feature/account-access/access-failure";
import { PasswordSchema } from "$lib/form/validators";
import { graphQLErrorCode, toGraphQLErrorText } from "$lib/graphql/errors";
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

export function createSignInForm() {
  return createForm(initialValues, validator, createSubmit());
}

function createSubmit() {
  const signInMutation = new SignInStore();

  return async (values: FormValues): Promise<FormSubmitResult> => {
    try {
      const response = await signInMutation.mutate({ input: values });

      if (!response.errors && response.data?.signIn) {
        await goto(resolve(PATH_DASHBOARD));
        return {};
      }

      const failurePath = accessFailurePath(graphQLErrorCode(response.errors));
      if (failurePath) {
        await goto(resolve(failurePath));
        return {};
      }

      return formError(toGraphQLErrorText(response.errors));
    } catch {
      return formError(networkErrorText);
    }
  };
}

export async function redirectActiveSession(): Promise<void> {
  const checkSessionQuery = new SignInSessionQueryStore();
  const response = await checkSessionQuery.fetch();
  if (!response.errors && response.data?.checkSession) {
    await goto(resolve(PATH_DASHBOARD));
    return;
  }

  const failurePath = accessFailurePath(graphQLErrorCode(response.errors));
  if (failurePath) {
    await goto(resolve(failurePath));
  }
}

function formError(error: string): FormSubmitResult {
  return { error };
}
