<script lang="ts">
  import { resolve } from "$app/paths";
  import { PhonePurchaseBusinessProfileStore } from "$houdini";
  import type { PhoneType$options } from "$houdini/graphql/enums";
  import { Alert, Card } from "$lib";
  import { PATH_BUSINESS_EDIT } from "$lib/app/paths";
  import { onMount } from "svelte";

  interface Props {
    onReadinessChange: (businessProfileReady: boolean, shortCodeBusinessReady: boolean) => void;
    selectedType: PhoneType$options;
  }

  let { onReadinessChange, selectedType }: Props = $props();

  const businessProfileQuery = new PhonePurchaseBusinessProfileStore();

  let businessName = $state<string | null>(null);
  let businessProfileReady = $state(false);
  let checkingBusiness = $state(true);
  let shortCodeBusinessReady = $state(false);

  onMount(() => {
    void loadBusinessProfile();
  });

  async function loadBusinessProfile(): Promise<void> {
    checkingBusiness = true;

    try {
      const response = await businessProfileQuery.fetch();
      const profile = !response.errors ? response.data?.businessProfile : null;
      businessProfileReady = Boolean(profile);
      shortCodeBusinessReady = Boolean(
        profile?.hasTaxId &&
        profile.businessRegistrationType?.trim() &&
        profile.taxIdIssuingCountry?.trim() &&
        profile.privacyPolicyUrl?.trim() &&
        profile.termsOfServiceUrl?.trim() &&
        profile.website.trim(),
      );
      businessName = profile?.displayName ?? null;
    } catch {
      businessProfileReady = false;
      shortCodeBusinessReady = false;
    } finally {
      checkingBusiness = false;
      onReadinessChange(businessProfileReady, shortCodeBusinessReady);
    }
  }
</script>

<Card variant="panel" class="p-4">
  <p class="text-xs font-semibold tracking-[0.06em] text-slate-500 uppercase">Step 1</p>
  <h2 class="mt-1 text-base font-semibold text-slate-800">Business information</h2>

  {#if checkingBusiness}
    <div class="skeleton-loading mt-3 h-16 rounded-xl"></div>
  {:else if businessProfileReady && (selectedType !== "SHORT_CODE" || shortCodeBusinessReady)}
    <div class="mt-3 rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
      {businessName || "Business profile"} is ready.
    </div>
    <a href={resolve(PATH_BUSINESS_EDIT)} class="mt-3 inline-block text-sm">Update information</a>
  {:else if businessProfileReady}
    <Alert type="warning" layout="inline" class="mt-3">
      Complete your tax, registration, policy, terms, and website details before applying for a short code.
    </Alert>
    <a
      href={resolve("/business/edit?returnTo=%2Fphone%2Fbuy")}
      class="mt-3 flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700
        px-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
    >
      Complete business information
    </a>
  {:else}
    <Alert type="warning" layout="inline" class="mt-3">
      Add your business and authorized-contact details before choosing a number.
    </Alert>
    <a
      href={resolve("/business/edit?returnTo=%2Fphone%2Fbuy")}
      class="mt-3 flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700
        px-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
    >
      Add business information
    </a>
  {/if}
</Card>
