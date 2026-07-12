<script lang="ts">
  import { onMount } from "svelte";
  import { BackButton, Button, Field, FieldError, FieldLabel, Input, PageTitle } from "$lib";
  import { PATH_CONTACT } from "$lib/app/paths";
  import type { ContactGroupDto, CustomFieldDto, CustomFieldType } from "$lib/api/index.schemas";
  import { getContact } from "$lib/api/contact/contact";
  import { fetchContactGroups as fetchContactGroupList } from "$lib/api/contact-group/contact-group";
  import { listCustomFields as listCustomFieldList } from "$lib/api/custom-field/custom-field";
  import type { ErrorResponse, Ulid } from "$lib/api/index.schemas";
  import { networkErrorText, toErrorText } from "$lib/form/errors";
  import { defaultContactGroupSorts } from "$lib/feature/contact-group/contact-group-sorting";
  import { customFieldTypeLabelMap } from "$lib/feature/custom-field/custom-field-view-data";
  import { tableSortsToDto } from "$lib/utils/table-sort";
  import {
    configureContactForm,
    form,
    serializeContactPayload,
    setContactCustomFields,
    setContactFormValues,
    toggleContactGroup,
    type FormMode,
  } from "./form.svelte";

  interface Props {
    id?: string;
    mode: FormMode;
  }

  let { id, mode }: Props = $props();

  let contactGroupList = $state<ContactGroupDto[]>([]);
  let customFields = $state<CustomFieldDto[]>([]);
  let metadataError = $state<string | null>(null);
  let initialPayload = $state("");
  let loadingForm = $state(false);

  const title = $derived(mode === "create" ? "Add contact" : "Edit contact");
  const submitLabel = $derived(mode === "create" ? "Create" : "Save");
  const formDirty = $derived(serializeContactPayload() !== initialPayload);
  const submitDisabled = $derived(form.loading || loadingForm || (mode === "edit" && !formDirty));

  onMount(() => {
    configureContactForm({ id, mode });
    void loadFormData();
  });

  function getResponseError(error?: ErrorResponse): string {
    return error?.errorDescription ?? toErrorText(error?.errorCode);
  }

  async function loadFormData(): Promise<void> {
    loadingForm = true;
    form.error = null;

    try {
      await Promise.all([
        loadContactGroupList(),
        loadCustomFieldList(),
        mode === "edit" ? loadContact() : Promise.resolve(),
      ]);
      initialPayload = serializeContactPayload();
    } finally {
      loadingForm = false;
    }
  }

  async function loadContact(): Promise<void> {
    if (!id) {
      form.error = "Contact was not found.";
      return;
    }

    try {
      const response = await getContact(id as Ulid, { credentials: "include" });

      if (response.status !== 200) {
        form.error = getResponseError(response.data);
        return;
      }

      setContactFormValues({
        birthday: response.data.birthday?.slice(0, 10) ?? "",
        contactGroupIds: response.data.contactGroupIds ?? [],
        customFieldValues: Object.fromEntries(
          (response.data.customFields ?? []).map((field) => [field.id, field.value]),
        ),
        email: response.data.email ?? "",
        firstName: response.data.firstName ?? "",
        lastName: response.data.lastName ?? "",
        notes: response.data.notes ?? "",
        phoneNumber: response.data.phoneNumber ?? "",
      });
    } catch {
      form.error = networkErrorText;
    }
  }

  async function loadContactGroupList(): Promise<void> {
    try {
      const response = await fetchContactGroupList(
        {
          pageSize: 300,
          sort: tableSortsToDto(defaultContactGroupSorts),
        },
        { credentials: "include" },
      );

      if (response.status !== 200) {
        metadataError = "Could not load groups.";
        return;
      }

      contactGroupList = response.data.items ?? [];
    } catch {
      metadataError = "Could not load groups.";
    }
  }

  async function loadCustomFieldList(): Promise<void> {
    try {
      const response = await listCustomFieldList({ credentials: "include" });

      if (response.status !== 200) {
        metadataError = "Could not load custom fields.";
        return;
      }

      customFields = response.data;
      setContactCustomFields(response.data);
    } catch {
      metadataError = "Could not load custom fields.";
    }
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
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle {title}>
    <BackButton href={PATH_CONTACT} />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <section
      class="w-full max-w-3xl rounded-2xl border border-white/80 bg-white/75 p-4
        shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:p-6"
    >
      <form onsubmit={form.submit} inert={form.loading || loadingForm || undefined}>
        <div class="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel for="contact-first-name">First name</FieldLabel>
            <Input id="contact-first-name" bind:value={form.firstName.value} maxlength={100} placeholder="Avery" />
          </Field>

          <Field>
            <FieldLabel for="contact-last-name">Last name</FieldLabel>
            <Input id="contact-last-name" bind:value={form.lastName.value} maxlength={100} placeholder="Johnson" />
          </Field>

          <Field>
            <FieldLabel for="contact-phone-number">Phone</FieldLabel>
            <Input
              id="contact-phone-number"
              bind:value={form.phoneNumber.value}
              maxlength={40}
              placeholder="+1 415 555 0127"
              error={form.phoneNumber.error}
            />
            <FieldError error={form.phoneNumber.error} />
          </Field>

          <Field>
            <FieldLabel for="contact-email">Email</FieldLabel>
            <Input
              id="contact-email"
              bind:value={form.email.value}
              maxlength={255}
              placeholder="avery@example.com"
              type="email"
            />
          </Field>

          <Field>
            <FieldLabel for="contact-birthday">Birthday</FieldLabel>
            <Input id="contact-birthday" bind:value={form.birthday.value} type="date" />
          </Field>
        </div>

        <Field class="mt-4">
          <FieldLabel for="contact-notes">Notes</FieldLabel>
          <textarea
            id="contact-notes"
            bind:value={form.notes.value}
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

          {#if contactGroupList.length > 0}
            <div class="grid gap-2 sm:grid-cols-2">
              {#each contactGroupList as group (group.id)}
                <label
                  class="flex min-h-10 items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3
                    py-2 text-sm text-slate-700 shadow-sm"
                >
                  <input
                    type="checkbox"
                    class="size-4 accent-slate-700"
                    checked={form.contactGroupIds.value.includes(group.id)}
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
                    bind:value={form.customFieldValues[field.id].value}
                    type={getCustomFieldInputType(field.type)}
                  />
                </Field>
              {/each}
            </div>
          </section>
        {/if}

        <FieldError class="mt-3" error={form.error} />

        {#if metadataError && !form.error}
          <div
            class="text-amber-900 mt-3 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm"
          >
            {metadataError}
          </div>
        {/if}

        <div class="mt-5 flex justify-end gap-2">
          <a
            href={PATH_CONTACT}
            class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
              text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            Cancel
          </a>
          <Button submit spinner={form.loading} disabled={submitDisabled}>{submitLabel}</Button>
        </div>
      </form>
    </section>
  </div>
</div>
