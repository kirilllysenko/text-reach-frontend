<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import { cache, CreateTenDlcBrandStore, TenDlcBrandBusinessProfileStore } from "$houdini";
  import { Alert, BackButton, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle } from "$lib";
  import { PATH_BUSINESS_EDIT, PATH_TEN_DLC } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "text-reach-frontend-library/form";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { createTenDlcBrandForm, type SubmitValues } from "./components/form/form.svelte";
  const notificationsState = getNotificationsState();

  const businessProfileQuery = new TenDlcBrandBusinessProfileStore();
  const createBrandMutation = new CreateTenDlcBrandStore();
  const form = createTenDlcBrandForm(submit);

  let loading = $state(true);
  let loadError = $state<string | null>(null);
  const business = $derived($businessProfileQuery.data?.businessProfile ?? null);

  onMount(() => {
    void loadBusiness();
  });

  async function loadBusiness(): Promise<void> {
    loading = true;
    loadError = null;
    try {
      const response = await businessProfileQuery.fetch();
      if (response.errors || !response.data?.businessProfile) {
        loadError = "Add your complete business information before registering a 10DLC brand.";
        return;
      }
      form.name.value = response.data.businessProfile.displayName;
    } catch {
      loadError = networkErrorText;
    } finally {
      loading = false;
    }
  }

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await createBrandMutation.mutate({ input });
      if (response.errors || !response.data?.createTenDlcBrand) return { error: "There was an error." };

      cache.markStale("TenDlcBrand");
      notificationsState.showInfo("10DLC brand registration submitted");
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
  <PageTitle title="Register 10DLC brand">
    <BackButton />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-2 pb-[max(4.5rem,env(safe-area-inset-bottom))]">
    <Card variant="panel" class="h-fit w-full max-w-3xl p-4 sm:p-6">
      {#if loadError}
        <div class="space-y-4 py-6 text-center">
          <Alert type="warning" layout="inline">{loadError}</Alert>
          <a
            href={resolve(`${PATH_BUSINESS_EDIT}?returnTo=${encodeURIComponent(PATH_TEN_DLC)}`)}
            class="text-sm font-medium"
          >
            Add business information
          </a>
        </div>
      {:else}
        <form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={loading}>
          <section aria-labelledby="brand-business-heading">
            <h2 id="brand-business-heading" class="text-lg font-semibold text-slate-800">Business identity</h2>
            <p class="mt-1 text-sm leading-6 text-slate-500">
              Carrier registration uses the legal and contact details from your business profile.
            </p>

            {#if loading}
              <div class="skeleton-loading mt-4 h-28 rounded-2xl"></div>
            {:else if business}
              <dl class="mt-4 grid gap-3 rounded-2xl border border-white/80 bg-white/70 p-4 sm:grid-cols-2">
                <div>
                  <dt class="text-xs text-slate-500">Legal name</dt>
                  <dd class="font-medium text-slate-700">{business.legalCompanyName}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500">Entity type</dt>
                  <dd class="font-medium text-slate-700">{business.entityType.replaceAll("_", " ")}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500">Email</dt>
                  <dd class="font-medium text-slate-700">{business.businessEmail}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500">Website</dt>
                  <dd class="truncate font-medium text-slate-700">{business.website}</dd>
                </div>
              </dl>
            {/if}
          </section>

          <Field class="mt-5">
            <FieldLabel for="ten-dlc-brand-name">Customer-facing brand name</FieldLabel>
            <Input id="ten-dlc-brand-name" field={form.name} {loading} maxlength={255} autocomplete="organization" />
            <FieldError error={form.name.error} />
          </Field>

          <FieldError class="mt-4" error={form.error} />

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button class="w-full sm:w-auto" variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
            <Button
              id="ten-dlc-brand-submit"
              class="w-full sm:w-auto"
              submit
              spinner={form.loading}
              disabled={loading || form.loading}>Submit brand</Button
            >
          </div>
        </form>
      {/if}
    </Card>
  </div>
</div>
