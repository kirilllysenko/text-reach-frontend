<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { BackButton, Button, Field, FieldError, FieldLabel, Input, PageTitle } from "$lib";
  import { PATH_CONTACT_GROUP } from "$lib/app/paths";
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
  let loadingContactGroup = $state(false);
  let saving = $state(false);

  const title = $derived(mode === "create" ? "Add contact group" : "Edit contact group");
  const submitLabel = $derived(mode === "create" ? "Create" : "Save");
  const nameDirty = $derived(name.trim() !== initialName);
  const submitDisabled = $derived(saving || loadingContactGroup || (mode === "edit" && !nameDirty));

  onMount(() => {
    if (mode === "edit") {
      loadingContactGroup = true;
      void loadContactGroup();
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

  async function loadContactGroup(): Promise<void> {
    if (!id) {
      formError = "Contact group was not found.";
      loadingContactGroup = false;
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
      loadingContactGroup = false;
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
        await submitCreateContactGroup();
      } else {
        await submitUpdateContactGroup();
      }
    } catch {
      formError = networkErrorText;
    } finally {
      saving = false;
    }
  }

  async function submitCreateContactGroup(): Promise<void> {
    const response = await createContactGroup({ name: name.trim() }, { credentials: "include" });

    if (response.status === 200) {
      notificationsState.showInfo("Contact group has been created");
      await goto(PATH_CONTACT_GROUP);
      return;
    }

    formError = getResponseError(response.data);
  }

  async function submitUpdateContactGroup(): Promise<void> {
    if (!id) {
      formError = "Contact group was not found.";
      return;
    }

    const response = await updateContactGroup(id as Ulid, { name: name.trim() }, { credentials: "include" });

    if (response.status === 200) {
      notificationsState.showInfo("Contact group has been updated");
      await goto(PATH_CONTACT_GROUP);
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
    <BackButton href={PATH_CONTACT_GROUP} />
  </PageTitle>

  <div class="flex min-h-0 grow items-center justify-center pb-18">
    <section
      class="w-full max-w-xl rounded-2xl border border-white/80 bg-white/75 p-4
        shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:p-6"
    >
      <form onsubmit={submit} inert={saving || loadingContactGroup || undefined}>
        <Field>
          <FieldLabel for="contact-group-name">Name</FieldLabel>
          <Input
            id="contact-group-name"
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
            href={PATH_CONTACT_GROUP}
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
