<script lang="ts">
  import { onDestroy } from "svelte";
  import { SendSignUpEmailCodeStore } from "$houdini";
  import { Button, Input } from "$lib";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import { defaultErrorText, networkErrorText } from "$lib/form/errors";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { Countdown } from "$lib/utils/countdown.svelte";
  import { OTP_LENGTH } from "$lib/form/validators";
  import { EmailSchema, form } from "../form.svelte";

  let { email, emailCode } = form;

  let codeLoading = $state(false);

  const countdown = new Countdown();
  const sendEmailCodeMutation = new SendSignUpEmailCodeStore();

  async function sendCodeClick(): Promise<void> {
    const emailResult = EmailSchema.safeParse(email.value);

    if (!emailResult.success) {
      email.error = emailResult.error.issues[0]?.message ?? defaultErrorText;
      return;
    }

    email.error = null;
    codeLoading = true;

    try {
      const response = await sendEmailCodeMutation.mutate({ email: email.value });

      if (!response.errors && response.data?.sendSignUpEmailCode) {
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

<Field>
  <FieldLabel for="email">E-mail</FieldLabel>
  <Input
    id="email"
    bind:value={email.value}
    type="email"
    autocomplete="email"
    placeholder="you@example.com"
    error={email.error}
  />
  <FieldError error={email.error} />
</Field>

<Field class="mt-4">
  <FieldLabel for="emailCode">E-mail confirmation code</FieldLabel>
  <Input
    id="emailCode"
    bind:value={emailCode.value}
    maxlength={OTP_LENGTH}
    autocomplete="one-time-code"
    error={emailCode.error}
  >
    {#snippet rightAddon()}
      <Button
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
  <FieldError error={emailCode.error} />
</Field>
