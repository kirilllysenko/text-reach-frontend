<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { cache, CreateContactGroupStore } from "$houdini";
  import { BackButton, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle } from "$lib";
  import { PATH_CONTACT_GROUP } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { createContactGroupForm, type SubmitValues } from "../../components/form/form.svelte";

  const createContactGroupMutation = new CreateContactGroupStore();
  const form = createContactGroupForm(submit);

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await createContactGroupMutation.mutate({ input });
      if (response.errors) {
        return { error: "There was an error." };
      }

      cache.markStale("ContactGroupConnection");
      notificationsState.showInfo("Contact group has been created");
      await goto(resolve(PATH_CONTACT_GROUP));
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
  <PageTitle title="Add contact group">
    <BackButton />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-xl p-4 sm:p-6">
      <form onsubmit={form.submit} inert={form.loading || undefined}>
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
          <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
          <Button submit spinner={form.loading} disabled={form.loading}>Add Contact Group</Button>
        </div>
      </form>
    </Card>
  </div>
</div>
