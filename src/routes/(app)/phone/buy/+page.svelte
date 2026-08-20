<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { AvailablePhoneNumbersStore, BuyPhoneNumberStore, cache, PhonePurchaseBusinessProfileStore } from "$houdini";
  import type { PhoneType$options } from "$houdini/graphql/enums";
  import { onMount } from "svelte";
  import { Alert, BackButton, Button, Card, Input, PageTitle, ResponsiveDialog } from "$lib";
  import { PATH_BUSINESS_EDIT, PATH_PAYMENT_TOP_UP, PATH_PHONE } from "$lib/app/paths";
  import { formatPhoneNumber, phoneTypeLabels } from "$lib/feature/phone/phone-display";
  import { graphQLErrorCode } from "$lib/graphql/errors";
  import { notificationsState } from "text-reach-frontend-library/state/notifications.svelte";

  interface AvailablePhone {
    phoneNumber: string;
    phoneType: PhoneType$options;
  }

  const phoneTypeOptions: PhoneType$options[] = ["TOLL_FREE", "TEN_DLC", "SHORT_CODE"];
  const businessProfileQuery = new PhonePurchaseBusinessProfileStore();
  const availablePhoneNumbersQuery = new AvailablePhoneNumbersStore();
  const buyPhoneNumberMutation = new BuyPhoneNumberStore();

  let selectedType = $state<PhoneType$options>("TOLL_FREE");
  let searchNumber = $state("");
  let availablePhones = $state<AvailablePhone[]>([]);
  let selectedPhone = $state<AvailablePhone | null>(null);
  let businessName = $state<string | null>(null);
  let businessProfileReady = $state(false);
  let checkingBusiness = $state(true);
  let searching = $state(false);
  let buying = $state(false);
  let searchError = $state<string | null>(null);
  let purchaseError = $state<string | null>(null);

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
      businessProfileReady = Boolean(!response.errors && response.data?.businessProfile);
      businessName = response.data?.businessProfile?.displayName ?? null;
    } catch {
      businessProfileReady = false;
    } finally {
      checkingBusiness = false;
    }
  }

  async function selectPhoneType(phoneType: PhoneType$options): Promise<void> {
    if (phoneType === selectedType || searching) {
      return;
    }

    selectedType = phoneType;
    await searchPhones();
  }

  async function searchPhones(): Promise<void> {
    if (!businessProfileReady || searching) {
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
          {:else if businessProfileReady}
            <div class="mt-3 rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
              {businessName || "Business profile"} is ready.
            </div>
            <a href={resolve(PATH_BUSINESS_EDIT)} class="mt-3 inline-block text-sm">Update information</a>
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
        <div>
          <p class="text-xs font-semibold tracking-[0.06em] text-slate-500 uppercase">Step 3</p>
          <h2 class="mt-1 text-lg font-semibold text-slate-800">Find an available number</h2>
          <p class="mt-1 text-sm text-slate-500">Search by area code or preferred digits.</p>
        </div>

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
            disabled={!businessProfileReady}
          />
          <Button class="sm:w-28" submit spinner={searching} disabled={!businessProfileReady || searching}
            >Search</Button
          >
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
