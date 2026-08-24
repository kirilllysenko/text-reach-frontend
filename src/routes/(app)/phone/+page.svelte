<script lang="ts">
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import { PhoneNumbersStore } from "$houdini";
  import { AccessGroup } from "$houdini/graphql/enums";
  import { Alert, Button, Card, PageTitle } from "$lib";
  import { PATH_BUSINESS, PATH_PHONE_BUY, PATH_TEN_DLC } from "$lib/app/paths";
  import { formatPhoneNumber, phoneTypeLabels } from "$lib/feature/phone/phone-display";
  import { sessionState } from "$lib/state/session.svelte";

  const phoneNumbersQuery = new PhoneNumbersStore();

  let loading = $state(true);
  let loadError = $state<string | null>(null);
  const phones = $derived($phoneNumbersQuery.data?.tenantPhones.edges.map((edge) => edge.node) ?? []);
  const canReadBusinessProfile = $derived(sessionState.hasAccess(AccessGroup.BUSINESS_PROFILE_READ));
  const canWritePhones = $derived(sessionState.hasAccess(AccessGroup.PHONE_WRITE));

  onMount(() => {
    void loadPhones();
  });

  async function loadPhones(): Promise<void> {
    loading = true;
    loadError = null;

    try {
      const response = await phoneNumbersQuery.fetch();
      if (response.errors || !response.data) {
        loadError = "There was an error.";
      }
    } catch {
      loadError = "Please check your internet connection and try again.";
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Phone numbers">
    {#if canWritePhones}
      <a
        id="phone-buy"
        href={resolve(PATH_PHONE_BUY)}
        class="flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700 px-3
          text-sm font-medium text-white shadow-sm hover:bg-slate-800"
      >
        Buy a number
      </a>
    {/if}
  </PageTitle>

  <div class="min-h-0 grow overflow-y-auto pb-[max(4.5rem,env(safe-area-inset-bottom))]">
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card variant="panel" class="p-4 sm:p-5">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-800">Your sending numbers</h2>
            <p class="mt-1 text-sm text-slate-500">Use these numbers for campaigns and conversations.</p>
          </div>
          {#if !loading && !loadError}
            <span class="text-sky-800 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold">
              {$phoneNumbersQuery.data?.tenantPhones.totalCount ?? phones.length}
            </span>
          {/if}
        </div>

        {#if loadError}
          <div class="space-y-3">
            <Alert type="error" layout="inline">{loadError}</Alert>
            <Button variant="secondary" onclick={loadPhones}>Try again</Button>
          </div>
        {:else if loading}
          <div class="grid gap-3 sm:grid-cols-2">
            {#each Array(4) as _, index (index)}
              <div class="skeleton-loading h-24 rounded-2xl"></div>
            {/each}
          </div>
        {:else if phones.length === 0}
          <div class="rounded-2xl border border-dashed border-slate-300 bg-white/50 px-4 py-10 text-center">
            <p class="font-medium text-slate-700">No phone numbers yet</p>
            <p class="mt-1 text-sm text-slate-500">Add a dedicated number to start sending messages.</p>
            {#if canWritePhones}
              <a
                id="phone-find-number"
                href={resolve(PATH_PHONE_BUY)}
                class="mt-4 inline-flex h-9 items-center justify-center rounded-xl border border-slate-700
                  bg-slate-700 px-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Find a number
              </a>
            {/if}
          </div>
        {:else}
          <div class="grid gap-3 sm:grid-cols-2">
            {#each phones as phone (phone.id)}
              <article
                id={`phone-list-item-${phone.phoneNumber.replace(/\D/g, "")}`}
                class="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm"
              >
                <p class="text-lg font-semibold text-slate-800">{formatPhoneNumber(phone.phoneNumber)}</p>
                <div class="mt-3 flex items-center justify-between gap-2">
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {phoneTypeLabels[phone.phoneType]}
                  </span>
                  <span class="text-xs font-medium text-emerald-700">Active</span>
                </div>
              </article>
            {/each}
          </div>
        {/if}
      </Card>

      <Card variant="panel" class="h-fit p-4 sm:p-5">
        {#if canReadBusinessProfile}
          <h2 class="text-lg font-semibold text-slate-800">Business information</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            Keep your legal business and authorized-contact details current before registering or purchasing numbers.
          </p>
          <a
            id="phone-business"
            href={resolve(PATH_BUSINESS)}
            class="mt-4 flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-3
              text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
          >
            Review business information
          </a>
        {/if}

        <div class={canReadBusinessProfile ? "mt-5 border-t border-slate-200/80 pt-5" : ""}>
          <h2 class="text-lg font-semibold text-slate-800">10DLC registration</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            Register your brand and messaging use case before purchasing a 10DLC number.
          </p>
          <a
            id="phone-ten-dlc-registration"
            href={resolve(PATH_TEN_DLC)}
            class="mt-4 flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-3
              text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
          >
            Manage 10DLC
          </a>
        </div>
      </Card>
    </div>
  </div>
</div>
