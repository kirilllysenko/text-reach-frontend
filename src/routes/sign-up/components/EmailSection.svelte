<script lang="ts">
  import { SendSignUpEmailCodeStore } from "$houdini";
  import { Input, OtpInput } from "$lib";
  import { Field, FieldError, FieldLabel } from "text-reach-frontend-library/components/field";
  import { defaultErrorText, networkErrorText } from "$lib/form/errors";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { EmailSchema, getSignUpForm } from "../form.svelte";
  const notificationsState = getNotificationsState();
  const form = getSignUpForm();

  let { email, emailCode } = form;

  const sendEmailCodeMutation = new SendSignUpEmailCodeStore();

  async function sendCode(): Promise<boolean> {
    const emailResult = EmailSchema.safeParse(email.value);

    if (!emailResult.success) {
      email.error = emailResult.error.issues[0]?.message ?? defaultErrorText;
      return false;
    }

    email.error = null;

    try {
      const response = await sendEmailCodeMutation.mutate({ email: email.value });

      if (!response.errors && response.data?.sendSignUpEmailCode) {
        return true;
      }

      notificationsState.showError(toGraphQLErrorText(response.errors));
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
  <FieldLabel for="emailCode">E-mail confirmation code</FieldLabel>
  <OtpInput id="emailCode" field={emailCode} onSend={sendCode} />
  <FieldError error={emailCode.error} />
</Field>
