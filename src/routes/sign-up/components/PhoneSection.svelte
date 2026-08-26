<script lang="ts">
  import { onDestroy } from "svelte";
  import { SendSignUpPhoneCodeStore } from "$houdini";
  import { Button, Input } from "$lib";
  import { Field, FieldError, FieldLabel } from "text-reach-frontend-library/components/field";
  import { defaultErrorText, networkErrorText } from "$lib/form/errors";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { Countdown } from "$lib/utils/countdown.svelte";
  import { normalizePhoneNumber, OTP_LENGTH, PhoneNumberSchema } from "$lib/form/validators";
  import { getSignUpForm } from "../form.svelte";
  const notificationsState = getNotificationsState();
  const form = getSignUpForm();

  let { phoneNumber, phoneNumberCode } = form;

  let codeLoading = $state(false);

  const countdown = new Countdown();
  const sendPhoneCodeMutation = new SendSignUpPhoneCodeStore();

  async function sendCodeClick(): Promise<void> {
    const phoneResult = PhoneNumberSchema.safeParse(phoneNumber.value);
    phoneNumber.error = phoneResult.success ? null : (phoneResult.error.issues[0]?.message ?? defaultErrorText);

    if (!phoneResult.success) {
      return;
    }

    codeLoading = true;

    try {
      const response = await sendPhoneCodeMutation.mutate({
        phoneNumber: normalizePhoneNumber(phoneNumber.value),
      });

      if (!response.errors && response.data?.sendSignUpPhoneCode) {
        countdown.start(60);
        return;
      }

      notificationsState.showError(toGraphQLErrorText(response.errors));
    } catch {
      notificationsState.showError(networkErrorText);
    } finally {
      codeLoading = false;
    }
  }

  onDestroy(() => {
    countdown.stop();
  });
</script>

<Field class="mt-4">
  <FieldLabel for="phoneNumber">Phone number</FieldLabel>
  <Input id="phoneNumber" field={phoneNumber} type="tel" autocomplete="tel" placeholder="(555) 123-4567" />
  <FieldError error={phoneNumber.error} />
</Field>

<Field class="mt-4">
  <FieldLabel for="phoneNumberCode">Phone number confirmation code</FieldLabel>
  <Input id="phoneNumberCode" field={phoneNumberCode} maxlength={OTP_LENGTH} autocomplete="one-time-code">
    {#snippet rightAddon()}
      <Button
        id="sign-up-phone-code-send"
        class="min-w-24 px-3 text-xs tracking-[0.02em]"
        variant="secondary"
        small
        spinner={codeLoading}
        disabled={codeLoading || countdown.remainingSeconds > 0}
        onclick={() => void sendCodeClick()}
      >
        {countdown.remainingSeconds === 0 ? "Send code" : countdown.remainingSeconds}
      </Button>
    {/snippet}
  </Input>
  <FieldError error={phoneNumberCode.error} />
</Field>
