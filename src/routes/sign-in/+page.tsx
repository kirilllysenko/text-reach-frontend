import { Title } from "@solidjs/meta";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import { z } from "zod";
import { SignInDocument, SignInSessionQueryDocument, type SignInInput } from "~/gql/graphql";
import { PATH_DASHBOARD, PATH_RESET_PASSWORD, PATH_SIGN_UP } from "~/lib/app/paths";
import { Alert, Button, Card, Field, FieldError, FieldLabel, Input, PasswordInput } from "~/components";
import { accessFailurePath } from "~/lib/feature/account-access/access-failure";
import { networkErrorText, toErrorText } from "~/lib/form/errors";
import { PasswordSchema } from "~/lib/form/validators";
import { validateFields, type FieldErrors } from "~/lib/form/validation";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode, graphQLErrorMessage } from "~/lib/graphql/errors";

const validator = z.object({
  email: z.email(),
  password: PasswordSchema,
});

type FormValues = z.infer<typeof validator>;

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [render, setRender] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [values, setValues] = createStore<FormValues>({ email: "", password: "" });
  const [errors, setErrors] = createStore<FieldErrors<FormValues>>({});

  onSettled(() => {
    void (async () => {
      try {
        const response = await graphqlClient
          .query(SignInSessionQueryDocument, {}, { requestPolicy: "network-only" })
          .toPromise();
        if (!response.error && response.data?.checkSession) {
          navigate(PATH_DASHBOARD, { replace: true });
          return;
        }

        const failurePath = accessFailurePath(graphQLErrorCode(response.error));
        if (failurePath) navigate(failurePath, { replace: true });
      } finally {
        setRender(true);
      }
    })();
  });

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validateFields(validator, { ...values });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await graphqlClient.mutation(SignInDocument, {
        input: values as SignInInput,
      });
      if (!response.error && response.data?.signIn) {
        navigate(PATH_DASHBOARD, { replace: true });
        return;
      }

      const errorCode = graphQLErrorCode(response.error);
      const failurePath = accessFailurePath(errorCode);
      if (failurePath) {
        navigate(failurePath, { replace: true });
        return;
      }

      const errorMessage = graphQLErrorMessage(response.error);
      setFormError(errorMessage && errorMessage !== errorCode ? errorMessage : toErrorText(errorCode));
    } catch {
      setFormError(networkErrorText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Show when={render()}>
      <Title>Sign in | Text Reach</Title>
      <div
        class={`flex min-h-full flex-col justify-center bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2`}
        inert={loading()}
      >
        <Show when={searchParams.sessionError === "SESSION_EXPIRED"}>
          <Alert type="warning">Your session has expired. Please sign in again.</Alert>
        </Show>
        <Show when={searchParams.sessionError === "SESSION_CLIENT_CHANGED"}>
          <Alert type="warning">
            Your browser has changed or your internet connection settings have changed. Please sign in again.
          </Alert>
        </Show>
        <Show when={formError()}>{(error) => <Alert type="error">{error()}</Alert>}</Show>
        <Show when={searchParams.signUpOk === "1"}>
          <Alert id="sign-up-success" type="success">
            Your 7-day trial has started. Use your email and password to sign in.
          </Alert>
        </Show>
        <Show when={searchParams.resetPasswordOk === "1"}>
          <Alert id="reset-password-success" type="success">
            Your password has been reset. Sign in with your new password.
          </Alert>
        </Show>

        <h1 class="mx-auto text-slate-800">Sign in</h1>
        <Card>
          <form onSubmit={submit}>
            <Field>
              <FieldLabel for="email">E-mail</FieldLabel>
              <Input
                id="email"
                value={values.email}
                onInput={(event) => setValues("email", event.currentTarget.value)}
                error={errors.email}
                autocomplete="email"
                placeholder="you@example.com"
              />
              <FieldError error={errors.email} />
            </Field>
            <Field class="mt-4">
              <FieldLabel for="password">Password</FieldLabel>
              <PasswordInput
                id="password"
                value={values.password}
                onInput={(event) => setValues("password", event.currentTarget.value)}
                error={errors.password}
              />
              <FieldError error={errors.password} />
            </Field>
            <FieldError error={formError()} />
            <Button id="sign-in-submit" class="mt-5 w-full" submit spinner={loading()}>
              Sign in
            </Button>
          </form>
          <p class="mt-10 text-center text-sm text-slate-500">
            No account? <a href={PATH_SIGN_UP}>Sign up</a>
          </p>
          <p class="mt-2 text-center text-sm text-slate-500">
            Forgot password? <a href={PATH_RESET_PASSWORD}>Reset password</a>
          </p>
        </Card>
      </div>
    </Show>
  );
}
