<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { cache, CreateCampaignStore } from "$houdini";
  import { BackButton, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle } from "$lib";
  import { PATH_CAMPAIGN } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "text-reach-frontend-library/form";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import ContactGroupsSection from "../../components/details/contact-groups/ContactGroupsSection.svelte";
  import SenderPhoneField from "../../components/details/sender/SenderPhoneField.svelte";
  import { createCampaignForm, type SubmitValues } from "../../components/form/form.svelte";
  import ImageLightbox from "../../components/message/images/ImageLightbox.svelte";
  import type { CampaignMediaDraft } from "../../components/message/images/media";
  import MessageSection from "../../components/message/MessageSection.svelte";
  import MessagePreview from "../../components/message/preview/MessagePreview.svelte";
  import ScheduleSection from "../../components/schedule/ScheduleSection.svelte";
  const notificationsState = getNotificationsState();

  const createCampaignMutation = new CreateCampaignStore();
  const form = createCampaignForm(submit);

  let imageUploading = $state(false);
  let previewImage = $state<CampaignMediaDraft | null>(null);
  let previewVisible = $state(true);
  let senderPhoneNumber = $state("");

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await createCampaignMutation.mutate({ input });
      if (response.errors || !response.data?.createCampaign) {
        return { error: "There was an error." };
      }

      cache.markStale("CampaignConnection");
      notificationsState.showInfo(
        form.scheduleType.value === "now" ? "Campaign has been queued for sending" : "Campaign has been scheduled",
      );
      await goto(resolve(PATH_CAMPAIGN), {
        state: { campaignListMode: form.scheduleType.value === "now" ? "history" : "schedule" },
      });
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
  <PageTitle title="Create campaign">
    <BackButton />
  </PageTitle>

  <div class="min-h-0 grow overflow-y-auto pb-18">
    <div
      class={[
        "mx-auto grid w-full max-w-7xl items-start gap-4",
        previewVisible ? "lg:grid-cols-[minmax(0,1fr)_22rem]" : "lg:grid-cols-[minmax(0,1fr)_3.5rem]",
      ]}
    >
      <Card variant="panel" class="min-w-0 p-4 sm:p-6">
        <form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={form.loading || imageUploading}>
          <section aria-labelledby="campaign-details-title">
            <h2 id="campaign-details-title" class="mb-3 text-base font-semibold text-slate-800">Campaign details</h2>

            <div class="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel for="campaign-name">Campaign name<span class="text-rose-500">*</span></FieldLabel>
                <Input id="campaign-name" field={form.name} maxlength={200} placeholder="August customer offer" />
                <FieldError error={form.name.error} />
              </Field>

              <SenderPhoneField field={form.tenantPhoneId} bind:phoneNumber={senderPhoneNumber} />
            </div>

            <ContactGroupsSection field={form.contactGroupIds} />
          </section>

          <MessageSection
            bind:parts={form.messageParts.value}
            bind:media={form.media.value}
            bind:uploading={imageUploading}
            disabled={form.loading}
            messageError={form.messageParts.error}
            onPreviewImage={(attachment) => (previewImage = attachment)}
          />

          <ScheduleSection
            bind:scheduleType={form.scheduleType}
            bind:scheduledAt={form.scheduledAt}
            bind:recurrenceFrequency={form.recurrenceFrequency}
            bind:recurrenceInterval={form.recurrenceInterval}
            bind:recurrenceCount={form.recurrenceCount}
          />

          <FieldError class="mt-4" error={form.error} />

          <div class="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
            <Button submit spinner={form.loading} disabled={form.loading || imageUploading}>
              {form.scheduleType.value === "now" ? "Create & send" : "Schedule campaign"}
            </Button>
          </div>
        </form>
      </Card>

      <MessagePreview
        bind:visible={previewVisible}
        parts={form.messageParts.value}
        media={form.media.value}
        {senderPhoneNumber}
      />
    </div>
  </div>
</div>

{#if previewImage}
  <ImageLightbox attachment={previewImage} onClose={() => (previewImage = null)} />
{/if}
