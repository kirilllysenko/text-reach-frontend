import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import { SignUpDocument } from "~/gql/graphql";
import { PATH_SIGN_IN } from "~/lib/app/paths";
import { Alert, Button, Card, Field, FieldError, FieldLabel, PasswordInput } from "~/components";
import { networkErrorText, toErrorText } from "~/lib/form/errors";
import { validateFields, type FieldErrors } from "~/lib/form/validation";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { EmailSection } from "./components/EmailSection";
import { PhoneSection } from "./components/PhoneSection";
import { signUpInput, signUpValidator, type SignUpValues } from "./form";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [values, setValues] = createStore<SignUpValues>({
    email: "",
    emailCode: "",
    phoneNumber: "",
    phoneNumberCode: "",
    password: "",
  });
  const [errors, setErrors] = createStore<FieldErrors<SignUpValues>>({});

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validateFields(signUpValidator, { ...values });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await graphqlClient.mutation(SignUpDocument, { input: signUpInput(values) });
      if (!response.error && response.data?.signUp) {
        navigate(`${PATH_SIGN_IN}?signUpOk=1`, { replace: true });
        return;
      }
      setFormError(toErrorText(graphQLErrorCode(response.error)));
    } catch {
      setFormError(networkErrorText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      id="sign-up-page"
      class="flex min-h-full flex-col justify-center bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2"
      inert={loading()}
    >
      <Title>Sign up | Text Reach</Title>
      <Show when={formError()}>{(error) => <Alert type="error">{error()}</Alert>}</Show>
      <div class="mx-auto mb-1 max-w-md text-center">
        <p class="text-xs font-semibold tracking-[0.12em] text-sky-700 uppercase">No payment method required</p>
        <h1 class="mt-2 text-slate-800">Start your 7-day free trial</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          Set up your workspace now. Submit your business profile during the trial to prepare for full access.
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
          <PhoneSection
            values={values}
            errors={errors}
            setValue={(field, value) => setValues(field, value)}
            setError={(field, error) => setErrors(field, error)}
          />
          <Field class="mt-4">
            <FieldLabel for="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              value={values.password}
              onInput={(event) => setValues("password", event.currentTarget.value)}
              autocomplete="new-password"
              placeholder="Create password"
              error={errors.password}
            />
            <FieldError error={errors.password} />
          </Field>
          <Button id="sign-up-submit" class="mt-5 w-full" submit spinner={loading()}>
            Sign up
          </Button>
        </form>
        <p class="mt-10 text-center text-sm text-slate-500">
          Already have an account? <a href={PATH_SIGN_IN}>Sign in</a>
        </p>
      </Card>
    </div>
  );
}
