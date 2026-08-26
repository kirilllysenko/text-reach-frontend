import { createSignal } from "solid-js";
import { SendSignUpPhoneCodeDocument } from "~/gql/graphql";
import { Button, Field, FieldError, FieldLabel, Input } from "~/components";
import { defaultErrorText, networkErrorText, toErrorText } from "~/lib/form/errors";
import { normalizePhoneNumber, OTP_LENGTH, PhoneNumberSchema } from "~/lib/form/validators";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { showError } from "~/lib/state/notifications";
import { createCountdown } from "~/lib/utils/countdown";
import type { SignUpFieldProps } from "../form";

export function PhoneSection(props: SignUpFieldProps<"phoneNumber" | "phoneNumberCode">) {
  const [codeLoading, setCodeLoading] = createSignal(false);
  const countdown = createCountdown();

  async function sendCode(): Promise<void> {
    const result = PhoneNumberSchema.safeParse(props.values.phoneNumber);
    if (!result.success) {
      props.setError("phoneNumber", result.error.issues[0]?.message ?? defaultErrorText);
      return;
    }

    props.setError("phoneNumber", undefined);
    setCodeLoading(true);
    try {
      const response = await graphqlClient.mutation(SendSignUpPhoneCodeDocument, {
        phoneNumber: normalizePhoneNumber(props.values.phoneNumber),
      });
      if (!response.error && response.data?.sendSignUpPhoneCode) {
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
      <Field class="mt-4">
        <FieldLabel for="phoneNumber">Phone number</FieldLabel>
        <Input
          id="phoneNumber"
          value={props.values.phoneNumber}
          onInput={(event) => props.setValue("phoneNumber", event.currentTarget.value)}
          type="tel"
          autocomplete="tel"
          placeholder="(555) 123-4567"
          error={props.errors.phoneNumber}
        />
        <FieldError error={props.errors.phoneNumber} />
      </Field>
      <Field class="mt-4">
        <FieldLabel for="phoneNumberCode">Phone number confirmation code</FieldLabel>
        <Input
          id="phoneNumberCode"
          value={props.values.phoneNumberCode}
          onInput={(event) => props.setValue("phoneNumberCode", event.currentTarget.value)}
          maxlength={OTP_LENGTH}
          autocomplete="one-time-code"
          error={props.errors.phoneNumberCode}
          rightAddon={
            <Button
              id="sign-up-phone-code-send"
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
        <FieldError error={props.errors.phoneNumberCode} />
      </Field>
    </>
  );
}
