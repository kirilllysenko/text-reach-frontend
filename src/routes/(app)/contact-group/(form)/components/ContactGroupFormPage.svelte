<script lang="ts">
  import { ContactGroupStore } from "$houdini";
  import { untrack } from "svelte";
  import { BackButton, Button, Field, FieldError, FieldLabel, Input, PageTitle } from "$lib";
  import { PATH_CONTACT_GROUP } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { configureContactGroupForm, form, setContactGroupFormValues, type FormMode } from "./form.svelte";

  interface Props {
    id?: string;
    mode: FormMode;
  }

  let { id, mode }: Props = $props();

  let initialName = $state("");
  let initializedContactGroupId = $state<string | null>(null);
  const initialProps = untrack(() => ({ id, mode }));

  configureContactGroupForm(initialProps);

  const contactGroupQuery = new ContactGroupStore();

  const contactGroup = $derived($contactGroupQuery.data?.contactGroup ?? null);
  const loadingContactGroup = $derived(initialProps.mode === "edit" && $contactGroupQuery.fetching && !contactGroup);

  const title = initialProps.mode === "create" ? "Add contact group" : "Edit contact group";
  const submitLabel = initialProps.mode === "create" ? "Create" : "Save";
  const nameDirty = $derived(form.name.value.trim() !== initialName);
  const submitDisabled = $derived(form.loading || loadingContactGroup || (initialProps.mode === "edit" && !nameDirty));

  $effect(() => {
    if (initialProps.mode !== "edit" || !initialProps.id) {
      return;
    }

    void contactGroupQuery.fetch({ variables: { id: initialProps.id } }).catch(() => (form.error = networkErrorText));
  });

  $effect(() => {
    if (!contactGroup || initializedContactGroupId === contactGroup.id) {
      return;
    }

    initializedContactGroupId = contactGroup.id;
    setContactGroupFormValues({ name: contactGroup.name });
    initialName = contactGroup.name.trim();
  });

  $effect(() => {
    if ($contactGroupQuery.errors) {
      form.error = toGraphQLErrorText($contactGroupQuery.errors);
    }
  });
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
      <form onsubmit={form.submit} inert={form.loading || loadingContactGroup || undefined}>
        <Field>
          <FieldLabel for="contact-group-name">Name</FieldLabel>
          <Input
            id="contact-group-name"
            bind:value={form.name.value}
            maxlength={100}
            placeholder="Newsletter subscribers"
            error={form.name.error}
          />
          <FieldError error={form.name.error} />
        </Field>

        <FieldError class="mt-3" error={form.error} />

        <div class="mt-5 flex justify-end gap-2">
          <a
            href={PATH_CONTACT_GROUP}
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
