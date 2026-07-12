<script lang="ts">
  import { Button, Field, FieldError, FieldLabel, Input } from "$lib";
  import { changeName } from "$lib/api/tenant/tenant";
  import { currentUserState } from "$lib/state/current-user.svelte";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { setProfileResponseErrors } from "./profile-errors";

  let name = $state("");
  let initialName = $state("");
  let initialized = $state(false);
  let savingName = $state(false);
  let nameError = $state<string | null>(null);
  let nameFormError = $state<string | null>(null);

  $effect(() => {
    if (initialized || !currentUserState.user) {
      return;
    }

    name = currentUserState.user.name ?? "";
    initialName = name;
    initialized = true;
  });

  const nameDirty = $derived(name !== initialName);

  async function submitName(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    nameError = null;
    nameFormError = null;
    savingName = true;

    const response = await changeName({ name: name.trim() }, { credentials: "include" });

    savingName = false;

    if (response.status === 200) {
      if (!currentUserState.user) {
        return;
      }

      const nextProfile = {
        ...currentUserState.user,
        name: name.trim(),
      };

      currentUserState.applyProfile(nextProfile);
      name = nextProfile.name ?? "";
      initialName = name;
      notificationsState.showInfo("Your name has been changed");
      return;
    }

    setProfileResponseErrors(
      response.data,
      {
        name: (value) => (nameError = value),
      },
      (value) => (nameFormError = value),
    );
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
