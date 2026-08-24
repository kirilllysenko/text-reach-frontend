<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import { cache, CreateTenDlcCampaignStore, TenDlcCampaignBrandStore } from "$houdini";
  import {
    Alert,
    BackButton,
    Button,
    Card,
    Field,
    FieldError,
    FieldLabel,
    Input,
    PageTitle,
    Select,
    TextArea,
  } from "$lib";
  import { PATH_TEN_DLC } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { tenDlcStatusLabel } from "$lib/feature/phone/ten-dlc-display";
  import { notificationsState } from "text-reach-frontend-library/state/notifications.svelte";
  import SupportingDocumentField from "../../components/SupportingDocumentField.svelte";
  import { createTenDlcCampaignForm, type SubmitValues } from "../../components/form/form.svelte";

  const usecaseOptions = [
    { id: "MIXED", value: "Mixed messaging" },
    { id: "CUSTOMER_CARE", value: "Customer care" },
    { id: "DELIVERY_NOTIFICATION", value: "Delivery notifications" },
    { id: "ACCOUNT_NOTIFICATION", value: "Account notifications" },
    { id: "2FA", value: "Two-factor authentication" },
    { id: "MARKETING", value: "Marketing" },
    { id: "LOW_VOLUME_MIXED", value: "Low-volume mixed" },
    { id: "PUBLIC_SERVICE_ANNOUNCEMENT", value: "Public service announcements" },
    { id: "SECURITY_ALERT", value: "Security alerts" },
    { id: "SOLE_PROPRIETOR", value: "Sole proprietor" },
  ];

  const brandQuery = new TenDlcCampaignBrandStore();
  const createCampaignMutation = new CreateTenDlcCampaignStore();
  const form = createTenDlcCampaignForm(submit);

  let loading = $state(true);
  let loadError = $state<string | null>(null);
  const brand = $derived($brandQuery.data?.tenDlcBrand ?? null);
  const selectedUsecase = $derived(usecaseOptions.find((option) => option.id === form.usecase.value));
  const brandVerified = $derived(
    !brand?.providerStatus || ["VERIFIED", "VETTED_VERIFIED"].includes(brand.providerStatus.toUpperCase()),
  );

  onMount(() => {
    void loadBrand();
  });

  async function loadBrand(): Promise<void> {
    loading = true;
    loadError = null;
    try {
      const response = await brandQuery.fetch();
      if (response.errors || !response.data?.tenDlcBrand)
        loadError = "Register a 10DLC brand before adding a campaign.";
    } catch {
      loadError = networkErrorText;
    } finally {
      loading = false;
    }
  }

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await createCampaignMutation.mutate({ input });
      if (response.errors || !response.data?.createTenDlcCampaign) return { error: "There was an error." };

      cache.markStale("TenDlcCampaignConnection");
      notificationsState.showInfo("10DLC campaign registration submitted");
      await goto(resolve(PATH_TEN_DLC));
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
  <PageTitle title="Register 10DLC campaign">
    <BackButton />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-2 pb-[max(4.5rem,env(safe-area-inset-bottom))]">
    <Card variant="panel" class="h-fit w-full max-w-4xl p-4 sm:p-6">
      {#if loadError}
        <div class="space-y-4 py-6 text-center">
          <Alert type="warning" layout="inline">{loadError}</Alert>
          <a href={resolve(PATH_TEN_DLC)} class="text-sm font-medium">Review 10DLC registration</a>
        </div>
      {:else if !loading && brand && !brandVerified}
        <div class="space-y-4 py-6 text-center">
          <Alert type="warning" layout="inline">
            {brand.name} is {tenDlcStatusLabel(brand.providerStatus).toLowerCase()}. Campaign registration is available
            after brand verification.
          </Alert>
          <a href={resolve(PATH_TEN_DLC)} class="text-sm font-medium">Review brand status</a>
        </div>
      {:else}
        <form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={loading}>
          <section aria-labelledby="ten-dlc-usecase-heading">
            <h2 id="ten-dlc-usecase-heading" class="text-lg font-semibold text-slate-800">Messaging use case</h2>
            <p class="mt-1 text-sm text-slate-500">Describe exactly what customers consent to receive.</p>

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <Field>
                <Select
                  inputId="ten-dlc-campaign-usecase"
                  label="Use case"
                  options={usecaseOptions}
                  value={selectedUsecase}
                  {loading}
                  error={form.usecase.error}
                  onChange={(option) => (form.usecase.value = option.id)}
                />
                <FieldError error={form.usecase.error} />
              </Field>
              <Field>
                <FieldLabel for="ten-dlc-campaign-description">Description</FieldLabel>
                <TextArea
                  id="ten-dlc-campaign-description"
                  bind:value={form.description.value}
                  {loading}
                  rows={4}
                  placeholder="Order confirmations and delivery updates for customers who opt in at checkout."
                />
                <FieldError error={form.description.error} />
              </Field>
            </div>
          </section>

          <section class="mt-6 border-t border-slate-200/80 pt-5" aria-labelledby="ten-dlc-consent-heading">
            <h2 id="ten-dlc-consent-heading" class="text-lg font-semibold text-slate-800">Consent and opt-in</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <Field class="sm:col-span-2">
                <FieldLabel for="ten-dlc-campaign-message-flow">How customers opt in</FieldLabel>
                <TextArea
                  id="ten-dlc-campaign-message-flow"
                  bind:value={form.messageFlow.value}
                  {loading}
                  rows={4}
                  placeholder="Customers enter their number and check the SMS consent box during checkout."
                />
                <FieldError error={form.messageFlow.error} />
              </Field>
              <SupportingDocumentField
                bind:value={form.documentUrl.value}
                disabled={loading || form.loading}
                error={form.documentUrl.error}
              />
              <Field>
                <FieldLabel for="ten-dlc-campaign-opt-in-keywords">Opt-in keywords</FieldLabel>
                <Input id="ten-dlc-campaign-opt-in-keywords" bind:value={form.optInKeywords.value} {loading} />
              </Field>
            </div>
          </section>

          <section class="mt-6 border-t border-slate-200/80 pt-5" aria-labelledby="ten-dlc-samples-heading">
            <h2 id="ten-dlc-samples-heading" class="text-lg font-semibold text-slate-800">Message samples</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel for="ten-dlc-campaign-sample-1">Sample message 1</FieldLabel>
                <TextArea id="ten-dlc-campaign-sample-1" bind:value={form.sampleMessage1.value} {loading} rows={4} />
                <FieldError error={form.sampleMessage1.error} />
              </Field>
              <Field>
                <FieldLabel for="ten-dlc-campaign-sample-2">Sample message 2</FieldLabel>
                <TextArea id="ten-dlc-campaign-sample-2" bind:value={form.sampleMessage2.value} {loading} rows={4} />
                <FieldError error={form.sampleMessage2.error} />
              </Field>
            </div>
          </section>

          <section class="mt-6 border-t border-slate-200/80 pt-5" aria-labelledby="ten-dlc-keywords-heading">
            <h2 id="ten-dlc-keywords-heading" class="text-lg font-semibold text-slate-800">Help and opt-out</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                ><FieldLabel for="ten-dlc-campaign-help-keywords">Help keywords</FieldLabel><Input
                  id="ten-dlc-campaign-help-keywords"
                  bind:value={form.helpKeywords.value}
                  {loading}
                /></Field
              >
              <Field
                ><FieldLabel for="ten-dlc-campaign-opt-out-keywords">Opt-out keywords</FieldLabel><Input
                  id="ten-dlc-campaign-opt-out-keywords"
                  bind:value={form.optOutKeywords.value}
                  {loading}
                /></Field
              >
              <Field
                ><FieldLabel for="ten-dlc-campaign-help-message">Help response</FieldLabel><TextArea
                  id="ten-dlc-campaign-help-message"
                  bind:value={form.helpMessage.value}
                  {loading}
                  rows={3}
                /></Field
              >
              <Field
                ><FieldLabel for="ten-dlc-campaign-opt-out-message">Opt-out response</FieldLabel><TextArea
                  id="ten-dlc-campaign-opt-out-message"
                  bind:value={form.optoutMessage.value}
                  {loading}
                  rows={3}
                /></Field
              >
            </div>
          </section>

          <section class="mt-6 border-t border-slate-200/80 pt-5" aria-labelledby="ten-dlc-options-heading">
            <h2 id="ten-dlc-options-heading" class="text-lg font-semibold text-slate-800">Content declarations</h2>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <label class="flex min-h-11 items-center gap-3 rounded-xl bg-white/70 px-3 text-sm text-slate-700">
                <input
                  id="ten-dlc-campaign-embedded-link"
                  type="checkbox"
                  bind:checked={form.embeddedLink.value}
                  disabled={loading}
                  class="accent-sky-600 size-4"
                />
                Messages include links
              </label>
              <label class="flex min-h-11 items-center gap-3 rounded-xl bg-white/70 px-3 text-sm text-slate-700">
                <input
                  id="ten-dlc-campaign-embedded-phone"
                  type="checkbox"
                  bind:checked={form.embeddedPhone.value}
                  disabled={loading}
                  class="accent-sky-600 size-4"
                />
                Messages include phone numbers
              </label>
              <label class="flex min-h-11 items-center gap-3 rounded-xl bg-white/70 px-3 text-sm text-slate-700">
                <input
                  id="ten-dlc-campaign-number-pool"
                  type="checkbox"
                  bind:checked={form.numberPool.value}
                  disabled={loading}
                  class="accent-sky-600 size-4"
                />
                Campaign uses a number pool
              </label>
              <label class="flex min-h-11 items-center gap-3 rounded-xl bg-white/70 px-3 text-sm text-slate-700">
                <input
                  id="ten-dlc-campaign-age-gated"
                  type="checkbox"
                  bind:checked={form.ageGated.value}
                  disabled={loading}
                  class="accent-sky-600 size-4"
                />
                Content is age-gated
              </label>
              <label class="flex min-h-11 items-center gap-3 rounded-xl bg-white/70 px-3 text-sm text-slate-700">
                <input
                  id="ten-dlc-campaign-direct-lending"
                  type="checkbox"
                  bind:checked={form.directLending.value}
                  disabled={loading}
                  class="accent-sky-600 size-4"
                />
                Campaign concerns direct lending
              </label>
            </div>
            <label
              class="mt-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-sm text-slate-700"
            >
              <input
                id="ten-dlc-campaign-terms"
                type="checkbox"
                bind:checked={form.termsAndConditions.value}
                disabled={loading}
                class="accent-sky-600 mt-0.5 size-4"
              />
              <span>I confirm that subscribers opt in, can request help, and can opt out at any time.</span>
            </label>
            <FieldError class="mt-2" error={form.termsAndConditions.error} />
          </section>

          <FieldError class="mt-4" error={form.error} />
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button class="w-full sm:w-auto" variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
            <Button
              id="ten-dlc-campaign-submit"
              class="w-full sm:w-auto"
              submit
              spinner={form.loading}
              disabled={loading || form.loading}>Submit campaign</Button
            >
          </div>
        </form>
      {/if}
    </Card>
  </div>
</div>
