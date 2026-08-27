<script lang="ts">
  import { ChangeProfileNameStore } from "$houdini";
  import { Button, Field, FieldError, FieldLabel, Input } from "$lib";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "text-reach-frontend-library/form";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { getSessionState } from "$lib/state/session.svelte";
  import { createProfileNameForm, type ProfileNameSubmitValues } from "./form/form.svelte";
  const notificationsState = getNotificationsState();
  const sessionState = getSessionState();

  const changeNameMutation = new ChangeProfileNameStore();

  const initialProfileName = sessionState.profile?.name ?? "";
  const form = createProfileNameForm(initialProfileName, submitName);
  let initialName = $state(initialProfileName);

  const nameDirty = $derived(form.name.value !== initialName);

  async function submitName(input: ProfileNameSubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await changeNameMutation.mutate(input);

      if (response.errors || !response.data?.changeProfileName) {
        return { error: toGraphQLErrorText(response.errors) };
      }

      if (!sessionState.profile) {
        return {};
      }

      const nextProfile = {
        ...sessionState.profile,
        name: input.name,
      };

      sessionState.applyProfile(nextProfile);
      form.setValues({ name: nextProfile.name ?? "" });
      initialName = form.name.value;
      notificationsState.showInfo("Your name has been changed");
      return {};
    } catch {
      return { error: networkErrorText };
    }
  }
</script>

<section>
  <h2 class="pb-3 text-slate-800">Change your name</h2>

  <form class="sm:max-w-md" onsubmit={form.submit} inert={form.loading || undefined}>
    <Field>
      <FieldLabel for="profile-name">Name</FieldLabel>
      <Input id="profile-name" field={form.name} maxlength={50} placeholder="Your name" />
      <FieldError error={form.name.error} />
    </Field>

    <FieldError class="mt-3" error={form.error} />

    <Button class="mt-4 w-30" submit spinner={form.loading} disabled={!nameDirty || form.loading}>Save</Button>
  </form>
</section>
