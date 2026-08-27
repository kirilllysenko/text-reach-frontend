<script lang="ts">
  import { resolve } from "$app/paths";
  import { AvailablePhoneNumbersStore, PhonePurchaseTenDlcCampaignsStore } from "$houdini";
  import type { PhoneType$options } from "$houdini/graphql/enums";
  import { Alert, Button, Input, Select } from "$lib";
  import { PATH_PAYMENT_TOP_UP, PATH_TEN_DLC } from "$lib/app/paths";
  import { isActiveTenDlcCampaignStatus } from "$lib/feature/phone/ten-dlc-display";
  import { onDestroy, onMount } from "svelte";
  import type { FormSubmitResult } from "text-reach-frontend-library/form";
  import type { AvailablePhone } from "./phone-buy-types";
  import PhoneSearchResults from "./PhoneSearchResults.svelte";
  import { createPhoneSearchForm, toPhoneSearchSubmitValues, type SubmitValues } from "./search/form.svelte";

  interface TenDlcCampaign {
    description: string;
    id: string;
    providerStatus: string | null;
    usecase: string;
  }

  interface Props {
    businessProfileReady: boolean;
    onChoose: (phone: AvailablePhone) => void;
    onClearPurchaseError: () => void;
    onPhoneSearchChange: (phoneSearch: string) => void;
    onSearchingChange: (searching: boolean) => void;
    onTenDlcCampaignChange: (campaignId: string) => void;
    phoneSearchValue: string;
    purchaseError: string | null;
    selectedType: PhoneType$options;
    tenDlcCampaignId: string;
  }

  let {
    businessProfileReady,
    onChoose,
    onClearPurchaseError,
    onPhoneSearchChange,
    onSearchingChange,
    onTenDlcCampaignChange,
    phoneSearchValue,
    purchaseError,
    selectedType,
    tenDlcCampaignId,
  }: Props = $props();

  const availablePhoneNumbersQuery = new AvailablePhoneNumbersStore();
  const tenDlcCampaignsQuery = new PhonePurchaseTenDlcCampaignsStore();
  const form = createPhoneSearchForm(searchPhones);

  let availablePhones = $state<AvailablePhone[]>([]);
  let searching = $state(false);
  let tenDlcCampaigns = $state<TenDlcCampaign[]>([]);
  let tenDlcCampaignsError = $state<string | null>(null);
  let tenDlcCampaignsLoading = $state(false);
  let requestVersion = 0;

  const tenDlcCampaignOptions = $derived(
    tenDlcCampaigns
      .filter((campaign) => isActiveTenDlcCampaignStatus(campaign.providerStatus))
      .map((campaign) => ({
        id: campaign.id,
        value: `${campaign.description} (${campaign.usecase.replaceAll("_", " ")})`,
      })),
  );
  const canSearch = $derived(
    businessProfileReady &&
      selectedType !== "SHORT_CODE" &&
      (selectedType !== "TEN_DLC" || Boolean(form.tenDlcCampaignId.value)),
  );

  onMount(() => {
    form.phoneSearch.value = phoneSearchValue;
    form.tenDlcCampaignId.value = tenDlcCampaignId;
    onClearPurchaseError();

    if (businessProfileReady && selectedType !== "SHORT_CODE") {
      void loadPhoneType(selectedType, ++requestVersion);
    }
  });

  onDestroy(() => {
    requestVersion += 1;
    onSearchingChange(false);
  });

  function setSearching(value: boolean): void {
    searching = value;
    onSearchingChange(value);
  }

  async function loadPhoneType(phoneType: PhoneType$options, version: number): Promise<void> {
    if (phoneType === "TEN_DLC") {
      const campaignReady = await loadTenDlcCampaigns(version);
      if (!campaignReady || version !== requestVersion) return;
    }

    const result = await runSearch(toPhoneSearchSubmitValues(form.toValues()), phoneType, version);
    if (version === requestVersion) form.error = result.error ?? null;
  }

  async function loadTenDlcCampaigns(version: number): Promise<boolean> {
    tenDlcCampaignsLoading = true;
    tenDlcCampaignsError = null;

    try {
      const response = await tenDlcCampaignsQuery.fetch();
      if (version !== requestVersion) return false;

      if (response.errors || !response.data) {
        clearTenDlcCampaign("There was an error.");
        return false;
      }

      tenDlcCampaigns = response.data.tenDlcCampaigns.edges.map((edge) => edge.node);
      const activeCampaigns = tenDlcCampaigns.filter((campaign) =>
        isActiveTenDlcCampaignStatus(campaign.providerStatus),
      );
      if (!activeCampaigns.some((campaign) => campaign.id === form.tenDlcCampaignId.value)) {
        form.tenDlcCampaignId.value = activeCampaigns[0]?.id ?? "";
      }
      onTenDlcCampaignChange(form.tenDlcCampaignId.value);
      return Boolean(form.tenDlcCampaignId.value);
    } catch {
      if (version !== requestVersion) return false;
      clearTenDlcCampaign("Please check your internet connection and try again.");
      return false;
    } finally {
      if (version === requestVersion) tenDlcCampaignsLoading = false;
    }
  }

  function clearTenDlcCampaign(error: string): void {
    tenDlcCampaigns = [];
    form.tenDlcCampaignId.value = "";
    onTenDlcCampaignChange("");
    tenDlcCampaignsError = error;
  }

  async function searchPhones(input: SubmitValues): Promise<FormSubmitResult> {
    return runSearch(input, selectedType, ++requestVersion);
  }

  async function runSearch(
    input: SubmitValues,
    phoneType: PhoneType$options,
    version: number,
  ): Promise<FormSubmitResult> {
    if (
      !businessProfileReady ||
      phoneType === "SHORT_CODE" ||
      (phoneType === "TEN_DLC" && !input.tenDlcCampaignId) ||
      searching
    ) {
      return {};
    }

    setSearching(true);
    onClearPurchaseError();

    try {
      const response = await availablePhoneNumbersQuery.fetch({
        variables: { input: { number: input.number, phoneType } },
      });
      if (version !== requestVersion) return {};

      if (response.errors || !response.data) {
        availablePhones = [];
        return { error: "There was an error." };
      }

      availablePhones = [...response.data.availableTenantPhones];
      return {};
    } catch {
      if (version !== requestVersion) return {};
      availablePhones = [];
      return { error: "Please check your internet connection and try again." };
    } finally {
      if (version === requestVersion) setSearching(false);
    }
  }
</script>

<div>
  <p class="text-xs font-semibold tracking-[0.06em] text-slate-500 uppercase">Step 3</p>
  <h2 class="mt-1 text-lg font-semibold text-slate-800">Find an available number</h2>
  <p class="mt-1 text-sm text-slate-500">Search by area code or preferred digits.</p>
</div>

{#if selectedType === "TEN_DLC"}
  <div class="mt-4 rounded-2xl border border-sky-200 bg-sky-50/70 p-3">
    {#if tenDlcCampaignsLoading}
      <div class="skeleton-loading h-16 rounded-xl"></div>
    {:else if tenDlcCampaignsError}
      <Alert type="error" layout="inline">{tenDlcCampaignsError}</Alert>
    {:else if tenDlcCampaignOptions.length === 0}
      <p class="text-sm font-medium text-slate-700">An approved 10DLC campaign is required.</p>
      <p class="mt-1 text-xs leading-5 text-slate-500">
        Complete brand and campaign registration before choosing a number.
      </p>
      <a id="ten-dlc-purchase-register" href={resolve(PATH_TEN_DLC)} class="mt-2 inline-block text-sm font-medium">
        Manage 10DLC registration
      </a>
    {:else}
      <Select
        inputId="ten-dlc-purchase-campaign"
        label="Approved 10DLC campaign"
        options={tenDlcCampaignOptions}
        field={form.tenDlcCampaignId}
        onChange={() => onTenDlcCampaignChange(form.tenDlcCampaignId.value)}
      />
    {/if}
  </div>
{/if}

<form class="mt-4 flex flex-col gap-2 sm:flex-row" onsubmit={form.submit} inert={form.loading || undefined}>
  <Input
    aria-label="Preferred phone number digits"
    inputmode="numeric"
    maxlength={10}
    placeholder="Area code or digits"
    field={form.phoneSearch}
    disabled={!canSearch}
    oninput={() => onPhoneSearchChange(form.phoneSearch.value)}
  />
  <Button class="sm:w-28" submit spinner={searching} disabled={!canSearch || searching || form.loading}>Search</Button>
</form>

{#if purchaseError}
  <Alert type="error" layout="inline" class="mt-4">
    {purchaseError}
    {#if purchaseError.startsWith("Your available balance")}
      <a href={resolve(PATH_PAYMENT_TOP_UP)} class="ml-1 underline">Top up balance</a>
    {/if}
  </Alert>
{/if}

{#if form.error}
  <Alert type="error" layout="inline" class="mt-4">{form.error}</Alert>
{/if}

<PhoneSearchResults {availablePhones} {businessProfileReady} {searching} searchError={form.error} {onChoose} />
