<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { Button, Field, FieldError, FieldLabel, Input, PageTitle } from "$lib";
  import { PATH_GROUPS } from "$lib/app/paths";
  import type { ErrorResponse, Ulid } from "$lib/api/index.schemas";
  import { createContactGroup, getContactGroup, updateContactGroup } from "$lib/api/contact-group/contact-group";
  import { networkErrorText, toErrorText } from "$lib/form/errors";
  import { notificationsState } from "$lib/state/notifications.svelte";

  type FormMode = "create" | "edit";

  interface Props {
    id?: string;
    mode: FormMode;
  }

  let { id, mode }: Props = $props();

  let name = $state("");
  let initialName = $state("");
  let nameError = $state<string | null>(null);
  let formError = $state<string | null>(null);
  let loadingGroup = $state(false);
  let saving = $state(false);

  const title = $derived(mode === "create" ? "Add group" : "Edit group");
  const submitLabel = $derived(mode === "create" ? "Create" : "Save");
  const nameDirty = $derived(name.trim() !== initialName);
  const submitDisabled = $derived(saving || loadingGroup || (mode === "edit" && !nameDirty));

  onMount(() => {
    if (mode === "edit") {
      loadingGroup = true;
      void loadGroup();
    }
  });

  function getResponseError(error?: ErrorResponse): string {
    return error?.errorDescription ?? toErrorText(error?.errorCode);
  }

  function validate(): boolean {
    nameError = null;
    formError = null;

    if (!name.trim()) {
      nameError = "Required";
      return false;
    }

    return true;
  }

  async function loadGroup(): Promise<void> {
    if (!id) {
      formError = "Group was not found.";
      loadingGroup = false;
      return;
    }

    try {
      const response = await getContactGroup(id as Ulid, { credentials: "include" });

      if (response.status !== 200) {
        formError = getResponseError(response.data);
        return;
      }

      name = response.data.name;
      initialName = response.data.name.trim();
    } catch {
      formError = networkErrorText;
    } finally {
      loadingGroup = false;
    }
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    saving = true;

    try {
      if (mode === "create") {
        await createGroup();
      } else {
        await updateGroup();
      }
    } catch {
      formError = networkErrorText;
    } finally {
      saving = false;
    }
  }

  async function createGroup(): Promise<void> {
    const response = await createContactGroup({ name: name.trim() }, { credentials: "include" });

    if (response.status === 200) {
      notificationsState.showInfo("Group has been created");
      await goto(PATH_GROUPS);
      return;
    }

    formError = getResponseError(response.data);
  }

  async function updateGroup(): Promise<void> {
    if (!id) {
      formError = "Group was not found.";
      return;
    }

    const response = await updateContactGroup(id as Ulid, { name: name.trim() }, { credentials: "include" });

    if (response.status === 200) {
      notificationsState.showInfo("Group has been updated");
      await goto(PATH_GROUPS);
      return;
    }

    formError = getResponseError(response.data);
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle {title}>
    <a
      href={PATH_GROUPS}
      class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
        text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
    >
      Back
    </a>
  </PageTitle>

  <div class="flex min-h-0 grow items-center justify-center pb-18">
    <section
      class="w-full max-w-xl rounded-2xl border border-white/80 bg-white/75 p-4
        shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:p-6"
    >
      <form onsubmit={submit} inert={saving || loadingGroup || undefined}>
        <Field>
          <FieldLabel for="group-name">Name</FieldLabel>
          <Input
            id="group-name"
            bind:value={name}
            maxlength={100}
            placeholder="Newsletter subscribers"
            error={nameError}
          />
          <FieldError error={nameError} />
        </Field>

        <FieldError class="mt-3" error={formError} />

        <div class="mt-5 flex justify-end gap-2">
          <a
            href={PATH_GROUPS}
            class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
              text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            Cancel
          </a>
          <Button submit spinner={saving} disabled={submitDisabled}>{submitLabel}</Button>
        </div>
      </form>
    </section>
  </div>
</div>
