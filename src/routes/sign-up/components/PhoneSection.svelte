<script lang="ts">
  import { SendSignUpPhoneCodeStore } from "$houdini";
  import { Input, OtpInput } from "$lib";
  import { Field, FieldError, FieldLabel } from "text-reach-frontend-library/components/field";
  import { defaultErrorText, networkErrorText } from "$lib/form/errors";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { normalizePhoneNumber, PhoneNumberSchema } from "$lib/form/validators";
  import { getSignUpForm } from "../form.svelte";
  const notificationsState = getNotificationsState();
  const form = getSignUpForm();

  let { phoneNumber, phoneNumberCode } = form;

  const sendPhoneCodeMutation = new SendSignUpPhoneCodeStore();

  async function sendCode(): Promise<boolean> {
    const phoneResult = PhoneNumberSchema.safeParse(phoneNumber.value);
    phoneNumber.error = phoneResult.success ? null : (phoneResult.error.issues[0]?.message ?? defaultErrorText);

    if (!phoneResult.success) {
      return false;
    }

    try {
      const response = await sendPhoneCodeMutation.mutate({
        phoneNumber: normalizePhoneNumber(phoneNumber.value),
      });

      if (!response.errors && response.data?.sendSignUpPhoneCode) {
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

<Field class="mt-4">
  <FieldLabel for="phoneNumber">Phone number</FieldLabel>
  <Input id="phoneNumber" field={phoneNumber} type="tel" autocomplete="tel" placeholder="(555) 123-4567" />
  <FieldError error={phoneNumber.error} />
</Field>

<Field class="mt-4">
  <FieldLabel for="phoneNumberCode">Phone number confirmation code</FieldLabel>
  <OtpInput id="phoneNumberCode" field={phoneNumberCode} onSend={sendCode} />
  <FieldError error={phoneNumberCode.error} />
</Field>
