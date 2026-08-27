<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { BuyPhoneNumberStore, cache, CreateShortCodeApplicationStore } from "$houdini";
  import type { PhoneType$options } from "$houdini/graphql/enums";
  import type { CreateShortCodeApplicationInput } from "$houdini/graphql/inputs";
  import { BackButton, Card, PageTitle } from "$lib";
  import { PATH_PHONE } from "$lib/app/paths";
  import { formatPhoneNumber } from "$lib/feature/phone/phone-display";
  import { networkErrorText } from "$lib/form/errors";
  import { graphQLErrorCode } from "$lib/graphql/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import type { FormSubmitResult } from "text-reach-frontend-library/form";
  import BusinessInformationCard from "./components/BusinessInformationCard.svelte";
  import type { AvailablePhone, SubmittedShortCodeApplication } from "./components/phone-buy-types";
  import PhonePurchaseDialog from "./components/PhonePurchaseDialog.svelte";
  import PhoneSearchPanel from "./components/PhoneSearchPanel.svelte";
  import PhoneTypeCard from "./components/PhoneTypeCard.svelte";
  import ShortCodePurchasePanel from "./components/ShortCodePurchasePanel.svelte";
  const notificationsState = getNotificationsState();

  const buyPhoneNumberMutation = new BuyPhoneNumberStore();
  const createShortCodeApplicationMutation = new CreateShortCodeApplicationStore();

  let selectedType = $state<PhoneType$options>("TOLL_FREE");
  let selectedPhone = $state<AvailablePhone | null>(null);
  let businessProfileReady = $state(false);
  let shortCodeBusinessReady = $state(false);
  let submittedShortCodeApplication = $state<SubmittedShortCodeApplication | null>(null);
  let searching = $state(false);
  let buying = $state(false);
  let phoneSearchValue = $state("");
  let purchaseError = $state<string | null>(null);
  let tenDlcCampaignId = $state("");

  function handleBusinessReadiness(businessReady: boolean, shortCodeReady: boolean): void {
    businessProfileReady = businessReady;
    shortCodeBusinessReady = shortCodeReady;
  }

  function selectPhoneType(phoneType: PhoneType$options): void {
    if (phoneType === selectedType || searching) {
      return;
    }

    selectedType = phoneType;
    clearPurchaseState();
  }

  function clearPurchaseState(): void {
    purchaseError = null;
    selectedPhone = null;
  }

  function choosePhone(phone: AvailablePhone): void {
    purchaseError = null;
    selectedPhone = phone;
  }

  function updateSearching(value: boolean): void {
    searching = value;
  }

  function updatePhoneSearch(value: string): void {
    phoneSearchValue = value;
  }

  function updateTenDlcCampaign(campaignId: string): void {
    tenDlcCampaignId = campaignId;
  }

  async function buySelectedPhone(): Promise<void> {
    if (!selectedPhone || buying) {
      return;
    }

    buying = true;
    purchaseError = null;

    try {
      const response = await buyPhoneNumberMutation.mutate({
        input: {
          number: selectedPhone.phoneNumber,
          phoneType: selectedPhone.phoneType,
          ...(selectedPhone.phoneType === "TEN_DLC" ? { tenDlcCampaignId } : {}),
        },
      });
      if (response.errors || !response.data) {
        const code = graphQLErrorCode(response.errors);
        purchaseError =
          code === "INSUFFICIENT_FUNDS"
            ? "Your available balance is too low to purchase this number."
            : code === "NOT_FOUND"
              ? "This number is no longer available. Search again to choose another number."
              : "There was an error.";
        selectedPhone = null;
        return;
      }

      cache.markStale("TenantPhoneConnection");
      cache.markStale("WalletBalance");
      notificationsState.showInfo(`${formatPhoneNumber(response.data.buyTenantPhone.phoneNumber)} is ready to use`);
      await goto(resolve(PATH_PHONE));
    } catch {
      purchaseError = "Please check your internet connection and try again.";
      selectedPhone = null;
    } finally {
      buying = false;
    }
  }

  async function submitShortCodeApplication(input: CreateShortCodeApplicationInput): Promise<FormSubmitResult> {
    try {
      const response = await createShortCodeApplicationMutation.mutate({ input });
      const application = response.data?.createShortCodeApplication;

      if (response.errors || !application) {
        return { error: "There was an error." };
      }

      submittedShortCodeApplication = {
        id: application.id,
        requestedShortCode: application.requestedShortCode ?? null,
        shortCodeType: application.shortCodeType,
      };
      notificationsState.showInfo("Short code application has been submitted");
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
  <PageTitle title="Buy a phone number">
    <BackButton />
  </PageTitle>

  <div class="min-h-0 grow overflow-y-auto pb-[max(4.5rem,env(safe-area-inset-bottom))]">
    <div class="mx-auto grid max-w-5xl gap-3 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside class="space-y-3">
        <BusinessInformationCard {selectedType} onReadinessChange={handleBusinessReadiness} />

        <PhoneTypeCard {selectedType} disabled={!businessProfileReady || searching} onSelect={selectPhoneType} />
      </aside>

      <Card variant="panel" class="p-4 sm:p-5">
        {#if selectedType === "SHORT_CODE"}
          <ShortCodePurchasePanel
            businessReady={shortCodeBusinessReady}
            submittedApplication={submittedShortCodeApplication}
            onSubmit={submitShortCodeApplication}
          />
        {:else}
          {#key `${selectedType}:${businessProfileReady}`}
            <PhoneSearchPanel
              {businessProfileReady}
              {phoneSearchValue}
              {purchaseError}
              {selectedType}
              {tenDlcCampaignId}
              onChoose={choosePhone}
              onClearPurchaseError={clearPurchaseState}
              onPhoneSearchChange={updatePhoneSearch}
              onSearchingChange={updateSearching}
              onTenDlcCampaignChange={updateTenDlcCampaign}
            />
          {/key}
        {/if}
      </Card>
    </div>
  </div>
</div>

<PhonePurchaseDialog
  phone={selectedPhone}
  {buying}
  onClose={() => (selectedPhone = null)}
  onConfirm={buySelectedPhone}
/>
