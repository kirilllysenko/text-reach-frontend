<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button, Input } from "$lib";
  import { sendPhoneCode } from "$lib/api/tenant/tenant";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import { defaultErrorText } from "$lib/form/errors";
  import type { FormField } from "$lib/form/form.svelte";
  import { Countdown } from "$lib/utils/countdown.svelte";
  import { normalizePhoneNumber, OTP_LENGTH, PhoneNumberSchema } from "$lib/form/validators";

  interface Props {
    phoneNumber: FormField<string>;
    phoneNumberCode: FormField<string>;
  }

  let { phoneNumber, phoneNumberCode }: Props = $props();

  let codeLoading = $state(false);

  const countdown = new Countdown();

  async function sendCodeClick(): Promise<void> {
    const phoneResult = PhoneNumberSchema.safeParse(phoneNumber.value);
    phoneNumber.error = phoneResult.success ? null : (phoneResult.error.issues[0]?.message ?? defaultErrorText);

    if (!phoneResult.success) {
      return;
    }

    codeLoading = true;

    try {
      const response = await sendPhoneCode(
        { phoneNumber: normalizePhoneNumber(phoneNumber.value) },
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
    bind:value={phoneNumber.value}
    type="tel"
    autocomplete="tel"
    placeholder="(555) 123-4567"
    error={phoneNumber.error}
  />
  <FieldError error={phoneNumber.error} />
</Field>

<Field class="mt-4">
  <FieldLabel for="phoneNumberCode">Phone number confirmation code</FieldLabel>
  <Input
    id="phoneNumberCode"
    bind:value={phoneNumberCode.value}
    maxlength={OTP_LENGTH}
    autocomplete="one-time-code"
    error={phoneNumberCode.error}
  >
    {#snippet rightAddon()}
      <Button
        class="min-w-24 px-3 text-xs tracking-[0.02em]"
        secondary
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
