<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { BusinessProfileEditStore, cache, UpsertBusinessProfileStore } from "$houdini";
  import { onMount } from "svelte";
  import { Button, Card, FieldError, PageTitle } from "$lib";
  import { PATH_BUSINESS, PATH_PHONE_BUY } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { graphQLErrorCode } from "$lib/graphql/errors";
  import { notificationsState } from "text-reach-frontend-library/state/notifications.svelte";
  import AddressSection from "../components/AddressSection.svelte";
  import AuthorizedContactSection from "../components/AuthorizedContactSection.svelte";
  import BusinessContactSection from "../components/BusinessContactSection.svelte";
  import CompanySection from "../components/CompanySection.svelte";
  import PolicySection from "../components/PolicySection.svelte";
  import TaxSection from "../components/TaxSection.svelte";
  import { createBusinessProfileForm, type FormValues, type SubmitValues } from "../components/form/form.svelte";

  const businessProfileQuery = new BusinessProfileEditStore();
  const upsertBusinessProfileMutation = new UpsertBusinessProfileStore();
  const form = createBusinessProfileForm(submit);

  let loading = $state(true);
  let loadError = $state<string | null>(null);
  let profileExists = $state(false);
  let existingTaxIdLastFour = $state<string | null>(null);
  const returnPath = $derived(safeReturnPath(page.url.searchParams.get("returnTo")));
  const pageTitle = $derived(profileExists ? "Update business information" : "Add business information");

  onMount(() => {
    void loadForm();
  });

  async function loadForm(): Promise<void> {
    loading = true;
    loadError = null;
    form.clearErrors();

    try {
      const response = await businessProfileQuery.fetch();
      if (response.errors) {
        if (graphQLErrorCode(response.errors) === "NOT_FOUND") {
          profileExists = false;
          existingTaxIdLastFour = null;
          return;
        }

        loadError = "There was an error.";
        return;
      }

      const profile = response.data?.businessProfile;
      if (!profile) {
        profileExists = false;
        return;
      }

      const values: FormValues = {
        legalCompanyName: profile.legalCompanyName,
        displayName: profile.displayName,
        entityType: profile.entityType,
        registrationCountry: profile.registrationCountry,
        taxId: "",
        taxIdIssuingCountry: profile.taxIdIssuingCountry ?? "",
        industry: profile.industry,
        address: {
          street: profile.address.street,
          city: profile.address.city,
          region: profile.address.region,
          postalCode: profile.address.postalCode,
          country: profile.address.country,
        },
        website: profile.website,
        businessPhone: profile.businessPhone,
        businessEmail: profile.businessEmail,
        authorizedContact: {
          firstName: profile.authorizedContact.firstName,
          lastName: profile.authorizedContact.lastName,
          title: profile.authorizedContact.title,
          phone: profile.authorizedContact.phone,
          email: profile.authorizedContact.email,
        },
        privacyPolicyUrl: profile.privacyPolicyUrl ?? "",
        termsOfServiceUrl: profile.termsOfServiceUrl ?? "",
      };

      profileExists = true;
      existingTaxIdLastFour = profile.hasTaxId ? profile.taxIdLastFour : null;
      form.setValues(values);
    } catch {
      loadError = networkErrorText;
    } finally {
      loading = false;
    }
  }

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await upsertBusinessProfileMutation.mutate({ input });
      if (response.errors || !response.data) {
        return { error: "There was an error." };
      }

      cache.markStale("BusinessProfile");
      notificationsState.showInfo(
        profileExists ? "Business information has been updated" : "Business information added",
      );
      await goto(resolve(returnPath));
      return {};
    } catch {
      return { error: networkErrorText };
    }
  }

  async function cancel(): Promise<void> {
    await goto(resolve(returnPath));
  }

  function safeReturnPath(value: string | null): typeof PATH_BUSINESS | typeof PATH_PHONE_BUY {
    return value === PATH_PHONE_BUY ? PATH_PHONE_BUY : PATH_BUSINESS;
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title={pageTitle} />

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-2 pb-[max(4.5rem,env(safe-area-inset-bottom))]">
    <Card variant="panel" class="h-fit w-full max-w-4xl p-4 sm:p-6">
      {#if loadError}
        <div class="space-y-4 py-6 text-center">
          <FieldError error={loadError} />
          <Button variant="secondary" onclick={loadForm}>Try again</Button>
        </div>
      {:else}
        <form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={loading}>
          <div class="space-y-6">
            <CompanySection {form} {loading} />
            <TaxSection {form} {loading} {existingTaxIdLastFour} />
            <AddressSection {form} {loading} />
            <BusinessContactSection {form} {loading} />
            <AuthorizedContactSection {form} {loading} />
            <PolicySection {form} {loading} />
          </div>

          <FieldError class="mt-4" error={form.error} />

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button class="w-full sm:w-auto" variant="secondary" onclick={cancel}>Cancel</Button>
            <Button class="w-full sm:w-auto" submit spinner={form.loading} disabled={loading || form.loading}>
              {profileExists ? "Update information" : "Save information"}
            </Button>
          </div>
        </form>
      {/if}
    </Card>
  </div>
</div>
