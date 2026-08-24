<script lang="ts">
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import { TenDlcBrandStore, TenDlcCampaignsStore } from "$houdini";
  import { AccessGroup } from "$houdini/graphql/enums";
  import { Alert, BackButton, Button, Card, PageTitle } from "$lib";
  import { PATH_PHONE_BUY, PATH_TEN_DLC_BRAND, PATH_TEN_DLC_CAMPAIGN_ADD } from "$lib/app/paths";
  import { isActiveTenDlcCampaignStatus, tenDlcStatusLabel } from "$lib/feature/phone/ten-dlc-display";
  import { graphQLErrorCode } from "$lib/graphql/errors";
  import { sessionState } from "$lib/state/session.svelte";

  const brandQuery = new TenDlcBrandStore();
  const campaignsQuery = new TenDlcCampaignsStore();

  let loading = $state(true);
  let loadError = $state<string | null>(null);
  let brandMissing = $state(false);
  const brand = $derived($brandQuery.data?.tenDlcBrand ?? null);
  const campaigns = $derived($campaignsQuery.data?.tenDlcCampaigns.edges.map((edge) => edge.node) ?? []);
  const activeCampaigns = $derived(
    campaigns.filter((campaign) => isActiveTenDlcCampaignStatus(campaign.providerStatus)),
  );
  const canWritePhones = $derived(sessionState.hasAccess(AccessGroup.PHONE_WRITE));

  onMount(() => {
    void loadRegistration();
  });

  async function loadRegistration(): Promise<void> {
    loading = true;
    loadError = null;
    brandMissing = false;

    try {
      const brandResponse = await brandQuery.fetch();
      if (brandResponse.errors) {
        if (graphQLErrorCode(brandResponse.errors) === "NOT_FOUND") {
          brandMissing = true;
          return;
        }
        loadError = "There was an error.";
        return;
      }

      const campaignResponse = await campaignsQuery.fetch();
      if (campaignResponse.errors) loadError = "There was an error.";
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
  <PageTitle title="10DLC registration">
    <BackButton />
  </PageTitle>

  <div class="min-h-0 grow overflow-y-auto pb-[max(4.5rem,env(safe-area-inset-bottom))]">
    <div class="mx-auto grid max-w-5xl gap-3 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <Card variant="panel" class="h-fit p-4 sm:p-5">
        <p class="text-xs font-semibold tracking-[0.06em] text-slate-500 uppercase">Brand</p>
        {#if loading}
          <div class="skeleton-loading mt-3 h-24 rounded-xl"></div>
        {:else if brandMissing && canWritePhones}
          <h2 class="mt-2 text-lg font-semibold text-slate-800">Register your business brand</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            We use your saved legal business and authorized-contact information for carrier registration.
          </p>
          <a
            id="ten-dlc-brand-start"
            href={resolve(PATH_TEN_DLC_BRAND)}
            class="mt-4 flex h-10 items-center justify-center rounded-xl bg-slate-700 px-3 text-sm font-medium
              text-white shadow-sm hover:bg-slate-800">Register brand</a
          >
        {:else if brandMissing}
          <h2 class="mt-2 text-lg font-semibold text-slate-800">No registered brand</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            A user with phone management access can register the business brand.
          </p>
        {:else if brand}
          <h2 id="ten-dlc-brand-name" class="mt-2 text-lg font-semibold text-slate-800">{brand.name}</h2>
          <p class="mt-2 text-sm text-slate-500">Status: {tenDlcStatusLabel(brand.providerStatus)}</p>
        {/if}
      </Card>

      <Card variant="panel" class="p-4 sm:p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold tracking-[0.06em] text-slate-500 uppercase">Campaigns</p>
            <h2 class="mt-1 text-lg font-semibold text-slate-800">Messaging use cases</h2>
          </div>
          {#if brand && !loadError && canWritePhones}
            <a
              id="ten-dlc-campaign-add"
              href={resolve(PATH_TEN_DLC_CAMPAIGN_ADD)}
              class="flex h-9 items-center justify-center rounded-xl bg-slate-700 px-3 text-sm font-medium text-white
                shadow-sm hover:bg-slate-800">Register campaign</a
            >
          {/if}
        </div>

        {#if loadError}
          <div class="mt-4 space-y-3">
            <Alert type="error" layout="inline">{loadError}</Alert>
            <Button variant="secondary" onclick={loadRegistration}>Try again</Button>
          </div>
        {:else if loading}
          <div class="mt-4 grid gap-3">
            {#each Array(2) as _, index (index)}
              <div class="skeleton-loading h-24 rounded-2xl"></div>
            {/each}
          </div>
        {:else if !brandMissing && campaigns.length === 0}
          <div class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/50 px-4 py-10 text-center">
            <p class="font-medium text-slate-700">No registered campaigns</p>
            <p class="mt-1 text-sm text-slate-500">Register how customers opt in and what messages they receive.</p>
          </div>
        {:else if campaigns.length > 0}
          <div class="mt-4 grid gap-3">
            {#each campaigns as campaign (campaign.id)}
              <article
                id={`ten-dlc-campaign-${campaign.id}`}
                class="rounded-2xl border border-white/80 bg-white/80 p-4"
              >
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p class="font-semibold text-slate-800">{campaign.description}</p>
                    <p class="mt-1 text-xs text-slate-500">{campaign.usecase.replaceAll("_", " ")}</p>
                  </div>
                  <span
                    class={[
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      isActiveTenDlcCampaignStatus(campaign.providerStatus)
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-amber-700 bg-amber-100",
                    ]}>{tenDlcStatusLabel(campaign.providerStatus)}</span
                  >
                </div>
              </article>
            {/each}
          </div>
        {/if}

        {#if activeCampaigns.length > 0 && canWritePhones}
          <a id="ten-dlc-buy-number" href={resolve(PATH_PHONE_BUY)} class="mt-4 inline-block text-sm font-medium">
            Buy a 10DLC number
          </a>
        {/if}
      </Card>
    </div>
  </div>
</div>
