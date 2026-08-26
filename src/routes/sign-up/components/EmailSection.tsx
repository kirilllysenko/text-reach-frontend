import { createSignal } from "solid-js";
import { SendSignUpEmailCodeDocument } from "~/gql/graphql";
import { Button, Field, FieldError, FieldLabel, Input } from "~/components";
import { defaultErrorText, networkErrorText, toErrorText } from "~/lib/form/errors";
import { OTP_LENGTH } from "~/lib/form/validators";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { showError } from "~/lib/state/notifications";
import { createCountdown } from "~/lib/utils/countdown";
import { EmailSchema, type SignUpFieldProps } from "../form";

export function EmailSection(props: SignUpFieldProps<"email" | "emailCode">) {
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
      const response = await graphqlClient.mutation(SendSignUpEmailCodeDocument, { email: props.values.email });
      if (!response.error && response.data?.sendSignUpEmailCode) {
        countdown.start(60);
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
        <FieldLabel for="emailCode">E-mail confirmation code</FieldLabel>
        <Input
          id="emailCode"
          value={props.values.emailCode}
          onInput={(event) => props.setValue("emailCode", event.currentTarget.value)}
          maxlength={OTP_LENGTH}
          autocomplete="one-time-code"
          error={props.errors.emailCode}
          rightAddon={
            <Button
              id="sign-up-email-code-send"
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
        <FieldError error={props.errors.emailCode} />
      </Field>
    </>
  );
}
