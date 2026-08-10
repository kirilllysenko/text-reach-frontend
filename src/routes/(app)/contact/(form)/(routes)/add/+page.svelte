<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { cache, CreateContactStore } from "$houdini";
  import { BackButton, Card, PageTitle } from "$lib";
  import { PATH_CONTACT } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import ContactForm from "../../components/ContactForm.svelte";
  import { createContactForm, type SubmitValues } from "../../components/form/form.svelte";

  const createContactMutation = new CreateContactStore();
  const form = createContactForm(submit);

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await createContactMutation.mutate({ input });
      if (response.errors) {
        return { error: "There was an error." };
      }

      cache.markStale("ContactConnection");
      notificationsState.showInfo("Contact has been created");
      await goto(resolve(PATH_CONTACT));
      return {};
    } catch {
      return { error: networkErrorText };
    }
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Add contact">
    <BackButton />
  </PageTitle>
  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-3xl p-4 sm:p-6">
      <ContactForm {form} submitLabel="Add Contact" />
    </Card>
  </div>
</div>
