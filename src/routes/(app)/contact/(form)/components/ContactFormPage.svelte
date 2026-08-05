<script lang="ts">
  import { resolve } from "$app/paths";
  import { graphql } from "$houdini";
  import { BackButton, Button, FieldError, PageTitle } from "$lib";
  import { PATH_CONTACT } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { onMount, untrack } from "svelte";
  import ContactBasicFields from "./ContactBasicFields.svelte";
  import ContactCustomFields from "./ContactCustomFields.svelte";
  import ContactGroupsField from "./ContactGroupsField.svelte";
  import { createContactForm, type FormMode } from "./form.svelte";

  interface Props {
    id?: string;
    mode: FormMode;
  }

  let { id, mode }: Props = $props();

  const options = untrack(() => ({ id, mode }));
  const contactPath = resolve(PATH_CONTACT);
  const contactForm = createContactForm(options);
  const { form } = contactForm;
  const createFormQuery = graphql(`
    query ContactFormCreateQuery @cache(policy: NetworkOnly) {
      contactGroups(first: 300, sortBy: [{ name: { direction: ASC } }]) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `);
  const editFormQuery = graphql(`
    query ContactFormEditQuery($id: Ulid!) @cache(policy: NetworkOnly) {
      contact(id: $id) {
        birthday
        contactGroups {
          id
        }
        email
        firstName
        lastName
        notes
        phoneNumber
      }
      contactGroups(first: 300, sortBy: [{ name: { direction: ASC } }]) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `);

  const queryData = $derived(options.mode === "create" ? $createFormQuery.data : $editFormQuery.data);
  const contactGroups = $derived(queryData?.contactGroups.edges.map((edge) => edge.node) ?? []);
  const title = options.mode === "create" ? "Add contact" : "Edit contact";
  const submitLabel = options.mode === "create" ? "Create" : "Save";
  const submitDisabled = $derived(
    form.loading || !contactForm.ready || (options.mode === "edit" && !contactForm.dirty),
  );

  onMount(() => {
    void loadForm();
  });

  async function loadForm(): Promise<void> {
    contactForm.startPageLoad();

    try {
      if (options.mode === "create") {
        const response = await createFormQuery.fetch();
        if (response.errors || !response.data) {
          contactForm.setPageError(toGraphQLErrorText(response.errors));
          return;
        }

        contactForm.setPageReady();
        return;
      }

      if (!options.id) {
        contactForm.setPageError("Contact was not found.");
        return;
      }

      const response = await editFormQuery.fetch({ variables: { id: options.id } });
      if (response.errors || !response.data?.contact) {
        contactForm.setPageError(toGraphQLErrorText(response.errors));
        return;
      }

      const contact = response.data.contact;
      contactForm.setContact({
        birthday: contact.birthday?.slice(0, 10) ?? "",
        contactGroupIds: contact.contactGroups.map((group) => group.id),
        email: contact.email ?? "",
        firstName: contact.firstName ?? "",
        lastName: contact.lastName ?? "",
        notes: contact.notes ?? "",
        phoneNumber: contact.phoneNumber,
      });
      contactForm.setPageReady();
    } catch {
      contactForm.setPageError(networkErrorText);
    } finally {
      contactForm.finishPageLoad();
    }
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle {title}>
    <BackButton href={contactPath} />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <section
      class="w-full max-w-3xl rounded-2xl border border-white/80 bg-white/75 p-4
        shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:p-6"
    >
      {#if contactForm.pageLoading}
        <p class="py-8 text-center text-sm text-slate-500">Loading contact form…</p>
      {:else if !contactForm.pageReady}
        <div class="space-y-4 py-6 text-center">
          <FieldError error={form.error} />
          <Button variant="secondary" onclick={loadForm}>Try again</Button>
        </div>
      {:else}
        <form onsubmit={form.submit} inert={form.loading || undefined}>
          <ContactBasicFields {form} />
          <ContactGroupsField {form} groups={contactGroups} onToggle={contactForm.toggleContactGroup} />
          <ContactCustomFields {contactForm} id={options.id} mode={options.mode} />

          <FieldError class="mt-3" error={form.error} />

          <div class="mt-5 flex justify-end gap-2">
            <a
              href={contactPath}
              class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
                text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
            >
              Cancel
            </a>
            <Button submit spinner={form.loading} disabled={submitDisabled}>{submitLabel}</Button>
          </div>
        </form>
      {/if}
    </section>
  </div>
</div>
