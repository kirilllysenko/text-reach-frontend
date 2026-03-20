<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button, Input } from "$lib";
  import { sendPhoneCode } from "$lib/api/sign-up/sign-up";
  import { type ErrorResponseDto } from "$lib/api/index.schemas";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import { defaultErrorText, networkErrorText, toErrorText } from "$lib/form/errors";
  import { Countdown } from "$lib/utils/countdown.svelte";
  import { normalizePhoneNumber, OTP_LENGTH, PhoneNumberSchema } from "$lib/form/validators";

  interface Props {
    phoneNumber: string;
    phoneNumberCode: string;
    phoneNumberError: string | null;
    phoneNumberCodeError: string | null;
  }

  let {
    phoneNumber = $bindable(""),
    phoneNumberCode = $bindable(""),
    phoneNumberError = $bindable(null),
    phoneNumberCodeError = $bindable(null),
  }: Props = $props();

  let codeLoading = $state(false);

  const countdown = new Countdown();

  async function sendCodeClick(): Promise<void> {
    const phoneResult = PhoneNumberSchema.safeParse(phoneNumber);
    phoneNumberError = phoneResult.success ? null : (phoneResult.error.issues[0]?.message ?? defaultErrorText);

    if (!phoneResult.success) {
      return;
    }

    codeLoading = true;

    try {
      const response = await sendPhoneCode(
        { phoneNumber: normalizePhoneNumber(phoneNumber) },
        { credentials: "include" },
      );

      if (response.status === 200) {
        countdown.start(60);
      }
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
  <Input
    id="phoneNumber"
    bind:value={phoneNumber}
    type="tel"
    autocomplete="tel"
    placeholder="(555) 123-4567"
    error={phoneNumberError}
  />
  <FieldError error={phoneNumberError} />
</Field>

<Field class="mt-4">
  <FieldLabel for="phoneNumberCode">Phone number confirmation code</FieldLabel>
  <div class="mt-1 flex gap-2">
    <Input
      id="phoneNumberCode"
      bind:value={phoneNumberCode}
      maxlength={OTP_LENGTH}
      autocomplete="one-time-code"
      error={phoneNumberCodeError}
    />
    <Button
      class="min-w-25"
      secondary
      small
      spinner={codeLoading}
      disabled={countdown.remainingSeconds > 0}
      onclick={sendCodeClick}
    >
      {countdown.remainingSeconds === 0 ? "Send code" : countdown.remainingSeconds}
    </Button>
  </div>
  <FieldError error={phoneNumberCodeError} />
</Field>
