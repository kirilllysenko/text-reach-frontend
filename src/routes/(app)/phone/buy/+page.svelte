<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import {
    AvailablePhoneNumbersStore,
    BuyPhoneNumberStore,
    cache,
    CreateShortCodeApplicationStore,
    PhonePurchaseBusinessProfileStore,
    PhonePurchaseTenDlcCampaignsStore,
  } from "$houdini";
  import type { PhoneType$options } from "$houdini/graphql/enums";
  import type { CreateShortCodeApplicationInput } from "$houdini/graphql/inputs";
  import { onMount } from "svelte";
  import { Alert, BackButton, Button, Card, Input, PageTitle, ResponsiveDialog, Select } from "$lib";
  import { PATH_BUSINESS_EDIT, PATH_PAYMENT_TOP_UP, PATH_PHONE, PATH_TEN_DLC } from "$lib/app/paths";
  import { formatPhoneNumber, phoneTypeLabels } from "$lib/feature/phone/phone-display";
  import { isActiveTenDlcCampaignStatus } from "$lib/feature/phone/ten-dlc-display";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { graphQLErrorCode } from "$lib/graphql/errors";
  import { notificationsState } from "text-reach-frontend-library/state/notifications.svelte";
  import ShortCodeApplicationForm from "./components/short-code/ShortCodeApplicationForm.svelte";

  interface AvailablePhone {
    phoneNumber: string;
    phoneType: PhoneType$options;
  }

  interface TenDlcCampaign {
    description: string;
    id: string;
    providerStatus: string | null;
    usecase: string;
  }

  interface SubmittedShortCodeApplication {
    id: string;
    requestedShortCode: string | null;
    shortCodeType: "RANDOM" | "VANITY";
  }

  const phoneTypeOptions: PhoneType$options[] = ["TOLL_FREE", "TEN_DLC", "SHORT_CODE"];
  const businessProfileQuery = new PhonePurchaseBusinessProfileStore();
  const availablePhoneNumbersQuery = new AvailablePhoneNumbersStore();
  const tenDlcCampaignsQuery = new PhonePurchaseTenDlcCampaignsStore();
  const buyPhoneNumberMutation = new BuyPhoneNumberStore();
  const createShortCodeApplicationMutation = new CreateShortCodeApplicationStore();

  let selectedType = $state<PhoneType$options>("TOLL_FREE");
  let searchNumber = $state("");
  let availablePhones = $state<AvailablePhone[]>([]);
  let selectedPhone = $state<AvailablePhone | null>(null);
  let businessName = $state<string | null>(null);
  let businessProfileReady = $state(false);
  let shortCodeBusinessReady = $state(false);
  let submittedShortCodeApplication = $state<SubmittedShortCodeApplication | null>(null);
  let checkingBusiness = $state(true);
  let searching = $state(false);
  let buying = $state(false);
  let searchError = $state<string | null>(null);
  let purchaseError = $state<string | null>(null);
  let tenDlcCampaigns = $state<TenDlcCampaign[]>([]);
  let tenDlcCampaignsLoading = $state(false);
  let tenDlcCampaignsError = $state<string | null>(null);
  let selectedTenDlcCampaignId = $state("");
  const tenDlcCampaignOptions = $derived(
    tenDlcCampaigns
      .filter((campaign) => isActiveTenDlcCampaignStatus(campaign.providerStatus))
      .map((campaign) => ({
        id: campaign.id,
        value: `${campaign.description} (${campaign.usecase.replaceAll("_", " ")})`,
      })),
  );
  const selectedTenDlcCampaign = $derived(
    tenDlcCampaignOptions.find((campaign) => campaign.id === selectedTenDlcCampaignId),
  );
  const canSearch = $derived(
    businessProfileReady &&
      selectedType !== "SHORT_CODE" &&
      (selectedType !== "TEN_DLC" || Boolean(selectedTenDlcCampaignId)),
  );

  onMount(() => {
    void initialize();
  });

  async function initialize(): Promise<void> {
    await loadBusinessProfile();
    if (businessProfileReady) {
      await searchPhones();
    }
  }

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
    }
  }

  async function selectPhoneType(phoneType: PhoneType$options): Promise<void> {
    if (phoneType === selectedType || searching) {
      return;
    }

    selectedType = phoneType;
    availablePhones = [];
    searchError = null;
    purchaseError = null;
    selectedPhone = null;

    if (phoneType === "SHORT_CODE") {
      availablePhones = [];
      return;
    }

    if (phoneType === "TEN_DLC") {
      await loadTenDlcCampaigns();
      if (!selectedTenDlcCampaignId) {
        availablePhones = [];
        return;
      }
    }
    await searchPhones();
  }

  async function loadTenDlcCampaigns(): Promise<void> {
    tenDlcCampaignsLoading = true;
    tenDlcCampaignsError = null;
    try {
      const response = await tenDlcCampaignsQuery.fetch();
      if (response.errors || !response.data) {
        tenDlcCampaigns = [];
        selectedTenDlcCampaignId = "";
        tenDlcCampaignsError = "There was an error.";
        return;
      }

      tenDlcCampaigns = response.data.tenDlcCampaigns.edges.map((edge) => edge.node);
      const activeCampaigns = tenDlcCampaigns.filter((campaign) =>
        isActiveTenDlcCampaignStatus(campaign.providerStatus),
      );
      if (!activeCampaigns.some((campaign) => campaign.id === selectedTenDlcCampaignId)) {
        selectedTenDlcCampaignId = activeCampaigns[0]?.id ?? "";
      }
    } catch {
      tenDlcCampaigns = [];
      selectedTenDlcCampaignId = "";
      tenDlcCampaignsError = "Please check your internet connection and try again.";
    } finally {
      tenDlcCampaignsLoading = false;
    }
  }

  async function searchPhones(): Promise<void> {
    if (!canSearch || searching) {
      return;
    }

    searching = true;
    searchError = null;
    purchaseError = null;
    selectedPhone = null;

    try {
      const number = searchNumber.replace(/\D/g, "");
      const response = await availablePhoneNumbersQuery.fetch({
        variables: {
          input: {
            number: number || null,
            phoneType: selectedType,
          },
        },
      });

      if (response.errors || !response.data) {
        availablePhones = [];
        searchError = "There was an error.";
        return;
      }

      availablePhones = [...response.data.availableTenantPhones];
    } catch {
      availablePhones = [];
      searchError = "Please check your internet connection and try again.";
    } finally {
      searching = false;
    }
  }

  function choosePhone(phone: AvailablePhone): void {
    purchaseError = null;
    selectedPhone = phone;
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
          ...(selectedPhone.phoneType === "TEN_DLC" ? { tenDlcCampaignId: selectedTenDlcCampaignId } : {}),
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

        <Card variant="panel" class="p-4">
          <p class="text-xs font-semibold tracking-[0.06em] text-slate-500 uppercase">Step 2</p>
          <h2 class="mt-1 text-base font-semibold text-slate-800">Choose number type</h2>
          <div class="mt-3 grid gap-2">
            {#each phoneTypeOptions as phoneType (phoneType)}
              <Button
                id={`phone-type-${phoneType.toLowerCase().replace("_", "-")}`}
                variant="secondary"
                active={selectedType === phoneType}
                class="h-11 justify-start px-3"
                disabled={!businessProfileReady || searching}
                onclick={() => selectPhoneType(phoneType)}
              >
                {phoneTypeLabels[phoneType]}
              </Button>
            {/each}
          </div>
        </Card>
      </aside>

      <Card variant="panel" class="p-4 sm:p-5">
        {#if selectedType === "SHORT_CODE"}
          <div>
            <p class="text-xs font-semibold tracking-[0.06em] text-slate-500 uppercase">Step 3</p>
            <h2 class="mt-1 text-lg font-semibold text-slate-800">Apply for a short code</h2>
            <p class="mt-1 text-sm leading-6 text-slate-500">
              Short codes require carrier review. Submit your messaging program and consent details to begin the managed
              registration process.
            </p>
          </div>

          {#if !shortCodeBusinessReady}
            <Alert type="warning" layout="inline" class="mt-4">
              Complete the short-code business requirements in Step 1 before submitting an application.
            </Alert>
          {:else if submittedShortCodeApplication}
            <div
              id="short-code-application-received"
              class="bg-emerald-50/90 mt-5 rounded-2xl border border-emerald-200 p-5"
            >
              <p class="text-emerald-900 text-lg font-semibold">Application received</p>
              <p class="text-emerald-800 mt-2 text-sm leading-6">
                Your application was saved for managed review. Purchasing and provisioning happen after carrier
                approval.
              </p>
              <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt class="text-emerald-700">Code preference</dt>
                  <dd class="text-emerald-950 mt-1 font-semibold">
                    {submittedShortCodeApplication.shortCodeType === "VANITY"
                      ? submittedShortCodeApplication.requestedShortCode
                      : "Carrier assigned"}
                  </dd>
                </div>
                <div>
                  <dt class="text-emerald-700">Application ID</dt>
                  <dd
                    id="short-code-application-id"
                    class="text-emerald-950 mt-1 font-mono text-xs font-semibold break-all"
                  >
                    {submittedShortCodeApplication.id}
                  </dd>
                </div>
              </dl>
              <a
                href={resolve(PATH_PHONE)}
                class="mt-5 inline-flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700
                  px-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Return to phone numbers
              </a>
            </div>
          {:else}
            <ShortCodeApplicationForm onSubmit={submitShortCodeApplication} />
          {/if}
        {:else}
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
                <a
                  id="ten-dlc-purchase-register"
                  href={resolve(PATH_TEN_DLC)}
                  class="mt-2 inline-block text-sm font-medium"
                >
                  Manage 10DLC registration
                </a>
              {:else}
                <Select
                  inputId="ten-dlc-purchase-campaign"
                  label="Approved 10DLC campaign"
                  options={tenDlcCampaignOptions}
                  value={selectedTenDlcCampaign}
                  onChange={(option) => (selectedTenDlcCampaignId = option.id)}
                />
              {/if}
            </div>
          {/if}

          <form
            class="mt-4 flex flex-col gap-2 sm:flex-row"
            onsubmit={(event) => {
              event.preventDefault();
              void searchPhones();
            }}
          >
            <Input
              aria-label="Preferred phone number digits"
              inputmode="numeric"
              maxlength={10}
              placeholder="Area code or digits"
              bind:value={searchNumber}
              disabled={!canSearch}
            />
            <Button class="sm:w-28" submit spinner={searching} disabled={!canSearch || searching}>Search</Button>
          </form>

          {#if purchaseError}
            <Alert type="error" layout="inline" class="mt-4">
              {purchaseError}
              {#if purchaseError.startsWith("Your available balance")}
                <a href={resolve(PATH_PAYMENT_TOP_UP)} class="ml-1 underline">Top up balance</a>
              {/if}
            </Alert>
          {/if}

          {#if searchError}
            <Alert type="error" layout="inline" class="mt-4">{searchError}</Alert>
          {/if}

          {#if searching}
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              {#each Array(6) as _, index (index)}
                <div class="skeleton-loading h-20 rounded-2xl"></div>
              {/each}
            </div>
          {:else if businessProfileReady && !searchError && availablePhones.length === 0}
            <div class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/50 px-4 py-10 text-center">
              <p class="font-medium text-slate-700">No matching numbers</p>
              <p class="mt-1 text-sm text-slate-500">Try fewer digits or choose another number type.</p>
            </div>
          {:else if availablePhones.length > 0}
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              {#each availablePhones as phone (phone.phoneNumber)}
                <article class="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm">
                  <div class="min-w-0 grow">
                    <p class="truncate font-semibold text-slate-800">{formatPhoneNumber(phone.phoneNumber)}</p>
                    <p class="mt-1 text-xs text-slate-500">{phoneTypeLabels[phone.phoneType]}</p>
                  </div>
                  <Button
                    id={`phone-buy-${phone.phoneNumber.replace(/\D/g, "")}`}
                    small
                    onclick={() => choosePhone(phone)}>Buy</Button
                  >
                </article>
              {/each}
            </div>
          {/if}
        {/if}
      </Card>
    </div>
  </div>
</div>

<ResponsiveDialog
  open={selectedPhone !== null}
  title="Confirm phone purchase"
  description="The phone-number purchase price will be charged to your available balance."
  onClose={() => {
    if (!buying) selectedPhone = null;
  }}
>
  {#if selectedPhone}
    <div class="rounded-xl border border-white/80 bg-white/80 p-4">
      <p class="text-xl font-semibold text-slate-800">{formatPhoneNumber(selectedPhone.phoneNumber)}</p>
      <p class="mt-1 text-sm text-slate-500">{phoneTypeLabels[selectedPhone.phoneType]}</p>
    </div>

    <div class="mt-5 flex justify-end gap-2">
      <Button variant="secondary" disabled={buying} onclick={() => (selectedPhone = null)}>Cancel</Button>
      <Button id="phone-buy-confirm" spinner={buying} onclick={buySelectedPhone}>Confirm purchase</Button>
    </div>
  {/if}
</ResponsiveDialog>
