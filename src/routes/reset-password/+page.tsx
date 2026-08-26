import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import { ResetPasswordDocument } from "~/gql/graphql";
import { PATH_SIGN_IN } from "~/lib/app/paths";
import { Alert, Button, Card, Field, FieldError, FieldLabel, PasswordInput } from "~/components";
import { defaultErrorText, networkErrorText } from "~/lib/form/errors";
import { validateFields, type FieldErrors } from "~/lib/form/validation";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { EmailSection } from "./components/EmailSection";
import { resetPasswordValidator, type ResetPasswordValues } from "./form";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [values, setValues] = createStore<ResetPasswordValues>({ email: "", code: "", newPassword: "" });
  const [errors, setErrors] = createStore<FieldErrors<ResetPasswordValues>>({});

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validateFields(resetPasswordValidator, { ...values });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await graphqlClient.mutation(ResetPasswordDocument, { input: values });
      if (!response.error && response.data?.resetPassword) {
        navigate(`${PATH_SIGN_IN}?resetPasswordOk=1`, { replace: true });
        return;
      }

      const code = graphQLErrorCode(response.error);
      setFormError(
        code === "INVALID_VALUE" || code === "NOT_FOUND"
          ? "The reset code is invalid or has expired."
          : defaultErrorText,
      );
    } catch {
      setFormError(networkErrorText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      id="reset-password-page"
      class="flex min-h-full flex-col justify-center bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2"
      inert={loading()}
    >
      <Title>Reset password | Text Reach</Title>
      <Show when={formError()}>{(error) => <Alert type="error">{error()}</Alert>}</Show>
      <div class="mx-auto mb-1 max-w-md text-center">
        <h1 class="text-slate-800">Reset password</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          Enter your email to receive a reset code, then choose a new password.
        </p>
      </div>
      <Card>
        <form onSubmit={submit}>
          <EmailSection
            values={values}
            errors={errors}
            setValue={(field, value) => setValues(field, value)}
            setError={(field, error) => setErrors(field, error)}
          />
          <Field class="mt-4">
            <FieldLabel for="new-password">New password</FieldLabel>
            <PasswordInput
              id="new-password"
              value={values.newPassword}
              onInput={(event) => setValues("newPassword", event.currentTarget.value)}
              autocomplete="new-password"
              placeholder="Create new password"
              error={errors.newPassword}
            />
            <FieldError error={errors.newPassword} />
          </Field>
          <Button id="reset-password-submit" class="mt-5 w-full" submit spinner={loading()}>
            Reset password
          </Button>
        </form>
        <p class="mt-10 text-center text-sm text-slate-500">
          Remembered your password? <a href={PATH_SIGN_IN}>Sign in</a>
        </p>
      </Card>
    </div>
  );
}
