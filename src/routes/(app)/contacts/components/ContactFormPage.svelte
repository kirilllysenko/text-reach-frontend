<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { Button, Field, FieldError, FieldLabel, Input, PageTitle } from "$lib";
  import { PATH_CONTACTS } from "$lib/app/paths";
  import {
    SortDirection,
    type ContactGroupDto,
    type CustomFieldDto,
    type CustomFieldType,
  } from "$lib/api/index.schemas";
  import { createContact, getContact, updateContact } from "$lib/api/contact/contact";
  import { fetchContactGroups } from "$lib/api/contact-group/contact-group";
  import { listCustomFields } from "$lib/api/custom-field/custom-field";
  import type { ContactCreateDto, ErrorResponse, Ulid } from "$lib/api/index.schemas";
  import { networkErrorText, toErrorText } from "$lib/form/errors";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { customFieldTypeLabelMap } from "$lib/features/custom-fields/custom-fields-view-data";

  type FormMode = "create" | "edit";

  interface Props {
    id?: string;
    mode: FormMode;
  }

  let { id, mode }: Props = $props();

  let firstName = $state("");
  let lastName = $state("");
  let phoneNumber = $state("");
  let email = $state("");
  let birthday = $state("");
  let notes = $state("");
  let selectedContactGroupIds = $state<string[]>([]);
  let contactGroups = $state<ContactGroupDto[]>([]);
  let customFields = $state<CustomFieldDto[]>([]);
  let customFieldValues = $state<Record<string, string>>({});
  let phoneNumberError = $state<string | null>(null);
  let formError = $state<string | null>(null);
  let metadataError = $state<string | null>(null);
  let initialPayload = $state("");
  let loadingForm = $state(false);
  let saving = $state(false);

  const title = $derived(mode === "create" ? "Add contact" : "Edit contact");
  const submitLabel = $derived(mode === "create" ? "Create" : "Save");
  const formDirty = $derived(serializePayload() !== initialPayload);
  const submitDisabled = $derived(saving || loadingForm || (mode === "edit" && !formDirty));

  onMount(() => {
    void loadFormData();
  });

  function getResponseError(error?: ErrorResponse): string {
    return error?.errorDescription ?? toErrorText(error?.errorCode);
  }

  function optionalText(value: string): string | null {
    const normalized = value.trim();
    return normalized || null;
  }

  function serializePayload(): string {
    return JSON.stringify(toPayload());
  }

  function toPayload(): ContactCreateDto {
    return {
      birthday: optionalText(birthday),
      contactGroupIds: selectedContactGroupIds,
      customFields: customFields.map((field) => ({
        id: field.id,
        value: (customFieldValues[field.id] ?? "").trim(),
      })),
      email: optionalText(email),
      firstName: optionalText(firstName),
      lastName: optionalText(lastName),
      notes: optionalText(notes),
      phoneNumber: phoneNumber.trim(),
    };
  }

  function validate(): boolean {
    phoneNumberError = null;
    formError = null;

    if (!phoneNumber.trim()) {
      phoneNumberError = "Required";
      return false;
    }

    return true;
  }

  async function loadFormData(): Promise<void> {
    loadingForm = true;

    try {
      await Promise.all([loadContactGroups(), loadCustomFields(), mode === "edit" ? loadContact() : Promise.resolve()]);
      initialPayload = serializePayload();
    } finally {
      loadingForm = false;
    }
  }

  async function loadContact(): Promise<void> {
    if (!id) {
      formError = "Contact was not found.";
      return;
    }

    try {
      const response = await getContact(id as Ulid, { credentials: "include" });

      if (response.status !== 200) {
        formError = getResponseError(response.data);
        return;
      }

      firstName = response.data.firstName ?? "";
      lastName = response.data.lastName ?? "";
      phoneNumber = response.data.phoneNumber ?? "";
      email = response.data.email ?? "";
      birthday = response.data.birthday?.slice(0, 10) ?? "";
      notes = response.data.notes ?? "";
      selectedContactGroupIds = response.data.contactGroupIds ?? [];
      customFieldValues = Object.fromEntries(
        (response.data.customFields ?? []).map((field) => [field.id, field.value]),
      );
    } catch {
      formError = networkErrorText;
    }
  }

  async function loadContactGroups(): Promise<void> {
    try {
      const response = await fetchContactGroups(
        {
          pageSize: 300,
          sort: {
            name: {
              order: 0,
              direction: SortDirection.ASC,
            },
          },
        },
        { credentials: "include" },
      );

      if (response.status !== 200) {
        metadataError = "Could not load groups.";
        return;
      }

      contactGroups = response.data.items ?? [];
    } catch {
      metadataError = "Could not load groups.";
    }
  }

  async function loadCustomFields(): Promise<void> {
    try {
      const response = await listCustomFields({ credentials: "include" });

      if (response.status !== 200) {
        metadataError = "Could not load custom fields.";
        return;
      }

      customFields = response.data;
    } catch {
      metadataError = "Could not load custom fields.";
    }
  }

  function toggleContactGroup(groupId: string): void {
    selectedContactGroupIds = selectedContactGroupIds.includes(groupId)
      ? selectedContactGroupIds.filter((value) => value !== groupId)
      : [...selectedContactGroupIds, groupId];
  }

  function updateCustomFieldValue(fieldId: string, value: string): void {
    customFieldValues = { ...customFieldValues, [fieldId]: value };
  }

  function getCustomFieldInputType(type: CustomFieldType): "date" | "number" | "text" {
    if (type === "DATE") {
      return "date";
    }

    if (type === "NUMBER") {
      return "number";
    }

    return "text";
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    saving = true;

    try {
      if (mode === "create") {
        await createContactFromForm();
      } else {
        await updateContactFromForm();
      }
    } catch {
      formError = networkErrorText;
    } finally {
      saving = false;
    }
  }

  async function createContactFromForm(): Promise<void> {
    const response = await createContact(toPayload(), { credentials: "include" });

    if (response.status === 200) {
      notificationsState.showInfo("Contact has been created");
      await goto(PATH_CONTACTS);
      return;
    }

    formError = getResponseError(response.data);
  }

  async function updateContactFromForm(): Promise<void> {
    if (!id) {
      formError = "Contact was not found.";
      return;
    }

    const response = await updateContact(id as Ulid, toPayload(), { credentials: "include" });

    if (response.status === 200) {
      notificationsState.showInfo("Contact has been updated");
      await goto(PATH_CONTACTS);
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
      href={PATH_CONTACTS}
      class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
        text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
    >
      Back
    </a>
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <section
      class="w-full max-w-3xl rounded-2xl border border-white/80 bg-white/75 p-4
        shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:p-6"
    >
      <form onsubmit={submit} inert={saving || loadingForm || undefined}>
        <div class="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel for="contact-first-name">First name</FieldLabel>
            <Input id="contact-first-name" bind:value={firstName} maxlength={100} placeholder="Avery" />
          </Field>

          <Field>
            <FieldLabel for="contact-last-name">Last name</FieldLabel>
            <Input id="contact-last-name" bind:value={lastName} maxlength={100} placeholder="Johnson" />
          </Field>

          <Field>
            <FieldLabel for="contact-phone-number">Phone</FieldLabel>
            <Input
              id="contact-phone-number"
              bind:value={phoneNumber}
              maxlength={40}
              placeholder="+1 415 555 0127"
              error={phoneNumberError}
            />
            <FieldError error={phoneNumberError} />
          </Field>

          <Field>
            <FieldLabel for="contact-email">Email</FieldLabel>
            <Input id="contact-email" bind:value={email} maxlength={255} placeholder="avery@example.com" type="email" />
          </Field>

          <Field>
            <FieldLabel for="contact-birthday">Birthday</FieldLabel>
            <Input id="contact-birthday" bind:value={birthday} type="date" />
          </Field>
        </div>

        <Field class="mt-4">
          <FieldLabel for="contact-notes">Notes</FieldLabel>
          <textarea
            id="contact-notes"
            bind:value={notes}
            maxlength={1000}
            rows="4"
            class="min-h-24 w-full resize-y rounded-[1.05rem] border-none bg-white/70 px-3 py-2 text-slate-700
              shadow-[inset_0px_0px_7px_3px_rgba(30,41,59,0.1)] transition-[box-shadow,background-color]
              duration-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            placeholder="Prefers afternoon texts"
          ></textarea>
        </Field>

        <section class="mt-5 space-y-2">
          <h2 class="text-sm font-medium text-slate-700">Groups</h2>

          {#if contactGroups.length > 0}
            <div class="grid gap-2 sm:grid-cols-2">
              {#each contactGroups as group (group.id)}
                <label
                  class="flex min-h-10 items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3
                    py-2 text-sm text-slate-700 shadow-sm"
                >
                  <input
                    type="checkbox"
                    class="size-4 accent-slate-700"
                    checked={selectedContactGroupIds.includes(group.id)}
                    onchange={() => toggleContactGroup(group.id)}
                  />
                  <span>{group.name}</span>
                </label>
              {/each}
            </div>
          {:else}
            <p class="rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-sm text-slate-500 shadow-sm">
              No groups available
            </p>
          {/if}
        </section>

        {#if customFields.length > 0}
          <section class="mt-5">
            <h2 class="mb-2 text-sm font-medium text-slate-700">Custom fields</h2>

            <div class="grid gap-4 sm:grid-cols-2">
              {#each customFields as field (field.id)}
                <Field>
                  <FieldLabel for={`contact-custom-field-${field.id}`}>
                    {field.name}
                    <span class="font-normal text-slate-400">({customFieldTypeLabelMap[field.type]})</span>
                  </FieldLabel>
                  <Input
                    id={`contact-custom-field-${field.id}`}
                    value={customFieldValues[field.id] ?? ""}
                    type={getCustomFieldInputType(field.type)}
                    oninput={(event) => updateCustomFieldValue(field.id, event.currentTarget.value)}
                  />
                </Field>
              {/each}
            </div>
          </section>
        {/if}

        <FieldError class="mt-3" error={formError} />

        {#if metadataError && !formError}
          <div
            class="text-amber-900 mt-3 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm"
          >
            {metadataError}
          </div>
        {/if}

        <div class="mt-5 flex justify-end gap-2">
          <a
            href={PATH_CONTACTS}
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
