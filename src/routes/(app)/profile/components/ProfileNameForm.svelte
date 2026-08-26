<script lang="ts">
  import { ChangeProfileNameStore } from "$houdini";
  import { Button, Field, FieldError, FieldLabel, Input } from "$lib";
  import { networkErrorText } from "$lib/form/errors";
  import { createFormValue } from "text-reach-frontend-library/form";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { getSessionState } from "$lib/state/session.svelte";
  const notificationsState = getNotificationsState();
  const sessionState = getSessionState();

  const changeNameMutation = new ChangeProfileNameStore();

  const initialProfileName = sessionState.profile?.name ?? "";
  const name = $state(createFormValue(initialProfileName));
  let initialName = $state(initialProfileName);
  let savingName = $state(false);
  let nameFormError = $state<string | null>(null);

  const nameDirty = $derived(name.value !== initialName);

  async function submitName(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    name.error = null;
    nameFormError = null;
    savingName = true;

    let response;
    try {
      response = await changeNameMutation.mutate({ name: name.value.trim() || null });
    } catch {
      savingName = false;
      nameFormError = networkErrorText;
      return;
    }

    savingName = false;

    if (!response.errors && response.data?.changeProfileName) {
      if (!sessionState.profile) {
        return;
      }

      const nextProfile = {
        ...sessionState.profile,
        name: name.value.trim(),
      };

      sessionState.applyProfile(nextProfile);
      name.value = nextProfile.name ?? "";
      initialName = name.value;
      notificationsState.showInfo("Your name has been changed");
      return;
    }

    nameFormError = toGraphQLErrorText(response.errors);
  }
</script>

<section>
  <h2 class="pb-3 text-slate-800">Change your name</h2>

  <form class="sm:max-w-md" onsubmit={submitName}>
    <Field>
      <FieldLabel for="profile-name">Name</FieldLabel>
      <Input id="profile-name" field={name} maxlength={50} placeholder="Your name" />
      <FieldError error={name.error} />
    </Field>

    <FieldError class="mt-3" error={nameFormError} />

    <Button class="mt-4 w-30" submit spinner={savingName} disabled={!nameDirty}>Save</Button>
  </form>
</section>
