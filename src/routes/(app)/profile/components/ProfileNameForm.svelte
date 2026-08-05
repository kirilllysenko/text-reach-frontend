<script lang="ts">
  import { ChangeProfileNameStore } from "$houdini";
  import { Button, Field, FieldError, FieldLabel, Input } from "$lib";
  import { networkErrorText } from "$lib/form/errors";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { sessionState } from "$lib/state/session.svelte";

  const changeNameMutation = new ChangeProfileNameStore();

  let name = $state("");
  let initialName = $state("");
  let initialized = $state(false);
  let savingName = $state(false);
  let nameError = $state<string | null>(null);
  let nameFormError = $state<string | null>(null);

  $effect(() => {
    if (initialized || !sessionState.profile) {
      return;
    }

    name = sessionState.profile.name ?? "";
    initialName = name;
    initialized = true;
  });

  const nameDirty = $derived(name !== initialName);

  async function submitName(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    nameError = null;
    nameFormError = null;
    savingName = true;

    let response;
    try {
      response = await changeNameMutation.mutate({ name: name.trim() || null });
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
        name: name.trim(),
      };

      sessionState.applyProfile(nextProfile);
      name = nextProfile.name ?? "";
      initialName = name;
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
      <Input id="profile-name" bind:value={name} maxlength={50} placeholder="Your name" error={nameError} />
      <FieldError error={nameError} />
    </Field>

    <FieldError class="mt-3" error={nameFormError} />

    <Button class="mt-4 w-30" submit spinner={savingName} disabled={!nameDirty}>Save</Button>
  </form>
</section>
