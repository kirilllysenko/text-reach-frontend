import { createSignal } from "solid-js";
import { SendPasswordResetCodeDocument } from "~/gql/graphql";
import { Button, Field, FieldError, FieldLabel, Input } from "~/components";
import { defaultErrorText, networkErrorText, toErrorText } from "~/lib/form/errors";
import { OTP_LENGTH } from "~/lib/form/validators";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { showError, showInfo } from "~/lib/state/notifications";
import { createCountdown } from "~/lib/utils/countdown";
import { EmailSchema, type ResetPasswordFieldProps } from "../form";

export function EmailSection(props: ResetPasswordFieldProps) {
  const [codeLoading, setCodeLoading] = createSignal(false);
  const countdown = createCountdown();

  async function sendCode(): Promise<void> {
    const result = EmailSchema.safeParse(props.values.email);
    if (!result.success) {
      props.setError("email", result.error.issues[0]?.message ?? defaultErrorText);
      return;
    }

    props.setError("email", undefined);
    setCodeLoading(true);
    try {
      const response = await graphqlClient.mutation(SendPasswordResetCodeDocument, { email: props.values.email });
      if (!response.error && response.data?.sendPasswordResetCode) {
        countdown.start(60);
        showInfo("If an account exists for that email, a reset code has been sent.");
        return;
      }
      showError(toErrorText(graphQLErrorCode(response.error)));
    } catch {
      showError(networkErrorText);
    } finally {
      setCodeLoading(false);
    }
  }

  return (
    <>
      <Field>
        <FieldLabel for="email">E-mail</FieldLabel>
        <Input
          id="email"
          value={props.values.email}
          onInput={(event) => props.setValue("email", event.currentTarget.value)}
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          error={props.errors.email}
        />
        <FieldError error={props.errors.email} />
      </Field>
      <Field class="mt-4">
        <FieldLabel for="reset-code">Reset code</FieldLabel>
        <Input
          id="reset-code"
          value={props.values.code}
          onInput={(event) => props.setValue("code", event.currentTarget.value)}
          maxlength={OTP_LENGTH}
          inputmode="numeric"
          autocomplete="one-time-code"
          error={props.errors.code}
          rightAddon={
            <Button
              id="reset-password-code-send"
              class="min-w-24 px-3 text-xs tracking-[0.02em]"
              variant="secondary"
              small
              spinner={codeLoading()}
              disabled={codeLoading() || countdown.remainingSeconds() > 0}
              onClick={() => void sendCode()}
            >
              {countdown.remainingSeconds() === 0 ? "Send code" : countdown.remainingSeconds()}
            </Button>
          }
        />
        <FieldError error={props.errors.code} />
      </Field>
    </>
  );
}
