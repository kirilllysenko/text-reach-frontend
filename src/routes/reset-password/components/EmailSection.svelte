<script lang="ts">
  import { SendPasswordResetCodeStore } from "$houdini";
  import { Field, FieldError, FieldLabel, Input, OtpInput } from "$lib";
  import { defaultErrorText, networkErrorText, toErrorText } from "$lib/form/errors";
  import { graphQLErrorCode } from "$lib/graphql/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { EmailSchema, getResetPasswordForm } from "../form.svelte";
  const notificationsState = getNotificationsState();
  const form = getResetPasswordForm();

  let { email, code } = form;

  const sendPasswordResetCodeMutation = new SendPasswordResetCodeStore();

  async function sendCode(): Promise<boolean> {
    const emailResult = EmailSchema.safeParse(email.value);

    if (!emailResult.success) {
      email.error = emailResult.error.issues[0]?.message ?? defaultErrorText;
      return false;
    }

    email.error = null;

    try {
      const response = await sendPasswordResetCodeMutation.mutate({ email: email.value });

      if (!response.errors && response.data?.sendPasswordResetCode) {
        notificationsState.showInfo("If an account exists for that email, a reset code has been sent.");
        return true;
      }

      notificationsState.showError(toErrorText(graphQLErrorCode(response.errors)));
      return false;
    } catch {
      notificationsState.showError(networkErrorText);
      return false;
    }
  }
</script>

<Field>
  <FieldLabel for="email">E-mail</FieldLabel>
  <Input id="email" field={email} type="email" autocomplete="email" placeholder="you@example.com" />
  <FieldError error={email.error} />
</Field>

<Field class="mt-4">
  <FieldLabel for="reset-code">Reset code</FieldLabel>
  <OtpInput id="reset-code" field={code} onSend={sendCode} />
  <FieldError error={code.error} />
</Field>
