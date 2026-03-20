<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button, Input } from "$lib";
  import { sendEmailCode } from "$lib/api/sign-up/sign-up";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import { defaultErrorText } from "$lib/form/errors";
  import { Countdown } from "$lib/utils/countdown.svelte";
  import { OTP_LENGTH } from "$lib/form/validators";
  import { EmailSchema } from "./form.svelte";

  interface Props {
    email: string;
    emailCode: string;
    emailError: string | null;
    emailCodeError: string | null;
  }

  let {
    email = $bindable(""),
    emailCode = $bindable(""),
    emailError = $bindable(null),
    emailCodeError = $bindable(null),
  }: Props = $props();

  let codeLoading = $state(false);

  const countdown = new Countdown();

  async function sendCodeClick(): Promise<void> {
    const emailResult = EmailSchema.safeParse(email);
    emailError = emailResult.success ? null : (emailResult.error.issues[0]?.message ?? defaultErrorText);

    if (!emailResult.success) {
      return;
    }

    codeLoading = true;

    try {
      const response = await sendEmailCode({ email }, { credentials: "include" });

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

<Field>
  <FieldLabel for="email">E-mail</FieldLabel>
  <Input
    id="email"
    bind:value={email}
    type="email"
    autocomplete="email"
    placeholder="you@example.com"
    error={emailError}
  />
  <FieldError error={emailError} />
</Field>

<Field class="mt-4">
  <FieldLabel for="emailCode">E-mail confirmation code</FieldLabel>
  <div class="mt-1 flex gap-2">
    <Input
      id="emailCode"
      bind:value={emailCode}
      maxlength={OTP_LENGTH}
      autocomplete="one-time-code"
      error={emailCodeError}
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
  <FieldError error={emailCodeError} />
</Field>
