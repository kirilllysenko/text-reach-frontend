<script lang="ts">
  import { SendPasswordResetCodeStore } from "$houdini";
  import { Button, Field, FieldError, FieldLabel, Input } from "$lib";
  import { defaultErrorText, networkErrorText, toErrorText } from "$lib/form/errors";
  import { OTP_LENGTH } from "$lib/form/validators";
  import { graphQLErrorCode } from "$lib/graphql/errors";
  import { Countdown } from "$lib/utils/countdown.svelte";
  import { onDestroy } from "svelte";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { EmailSchema, getResetPasswordForm } from "../form.svelte";
  const notificationsState = getNotificationsState();
  const form = getResetPasswordForm();

  let { email, code } = form;

  let codeLoading = $state(false);

  const countdown = new Countdown();
  const sendPasswordResetCodeMutation = new SendPasswordResetCodeStore();

  async function sendCodeClick(): Promise<void> {
    const emailResult = EmailSchema.safeParse(email.value);

    if (!emailResult.success) {
      email.error = emailResult.error.issues[0]?.message ?? defaultErrorText;
      return;
    }

    email.error = null;
    codeLoading = true;

    try {
      const response = await sendPasswordResetCodeMutation.mutate({ email: email.value });

      if (!response.errors && response.data?.sendPasswordResetCode) {
        countdown.start(60);
        notificationsState.showInfo("If an account exists for that email, a reset code has been sent.");
        return;
      }

      notificationsState.showError(toErrorText(graphQLErrorCode(response.errors)));
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

<Field>
  <FieldLabel for="email">E-mail</FieldLabel>
  <Input id="email" field={email} type="email" autocomplete="email" placeholder="you@example.com" />
  <FieldError error={email.error} />
</Field>

<Field class="mt-4">
  <FieldLabel for="reset-code">Reset code</FieldLabel>
  <Input id="reset-code" field={code} maxlength={OTP_LENGTH} inputmode="numeric" autocomplete="one-time-code">
    {#snippet rightAddon()}
      <Button
        id="reset-password-code-send"
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
  <FieldError error={code.error} />
</Field>
