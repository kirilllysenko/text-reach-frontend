import { createSignal, For, onSettled, Show } from "solid-js";
import {
  TenDlcBrandDocument,
  TenDlcCampaignsDocument,
  type TenDlcBrandQuery,
  type TenDlcCampaignsQuery,
} from "~/gql/graphql";
import { PATH_PHONE, PATH_PHONE_BUY, PATH_TEN_DLC_BRAND, PATH_TEN_DLC_CAMPAIGN_ADD } from "~/lib/app/paths";
import { Alert, Button, Card, PageTitle } from "~/components";
import { isActiveTenDlcCampaignStatus, tenDlcStatusLabel } from "~/lib/feature/phone/phone-display";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { hasAccess } from "~/lib/state/session";
type Brand = TenDlcBrandQuery["tenDlcBrand"];
type Campaign = TenDlcCampaignsQuery["tenDlcCampaigns"]["edges"][number]["node"];
export default function TenDlcPage() {
  const [brand, setBrand] = createSignal<Brand | null>(null);
  const [campaigns, setCampaigns] = createSignal<Campaign[]>([]);
  const [missing, setMissing] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  onSettled(() => void load());
  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    setMissing(false);
    try {
      const brandResult = await graphqlClient.query(TenDlcBrandDocument, {}, { requestPolicy: "network-only" });
      if (brandResult.error) {
        if (graphQLErrorCode(brandResult.error) === "NOT_FOUND") {
          setMissing(true);
          return;
        }
        throw new Error();
      }
      setBrand(brandResult.data?.tenDlcBrand ?? null);
      const campaignResult = await graphqlClient.query(TenDlcCampaignsDocument, {}, { requestPolicy: "network-only" });
      if (campaignResult.error || !campaignResult.data) throw new Error();
      setCampaigns(campaignResult.data.tenDlcCampaigns.edges.map((edge) => edge.node));
    } catch {
      setError("Could not load 10DLC registration.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="10DLC registration">
        <a href={PATH_PHONE} class="text-sm font-medium text-sky-700">
          Phone numbers
        </a>
      </PageTitle>
      <div class="min-h-0 grow overflow-y-auto pb-18">
        <div class="mx-auto grid max-w-5xl gap-3 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <Card variant="panel" class="h-fit p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase">Brand</p>
            <Show when={!loading()} fallback={<div class="skeleton-loading mt-3 h-24 rounded-xl" />}>
              <Show
                when={!missing()}
                fallback={
                  <>
                    <h2 class="mt-2 text-lg font-semibold">Register your business brand</h2>
                    <Show when={hasAccess("PHONE_WRITE")}>
                      <a href={PATH_TEN_DLC_BRAND} class="mt-4 block text-sm font-medium text-sky-700">
                        Register brand
                      </a>
                    </Show>
                  </>
                }
              >
                <Show when={brand()}>
                  {(value) => (
                    <>
                      <h2 class="mt-2 text-lg font-semibold">{value().name}</h2>
                      <p class="mt-2 text-sm text-slate-500">Status: {tenDlcStatusLabel(value().providerStatus)}</p>
                    </>
                  )}
                </Show>
              </Show>
            </Show>
          </Card>
          <Card variant="panel" class="p-5">
            <div class="flex justify-between gap-3">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase">Campaigns</p>
                <h2 class="mt-1 text-lg font-semibold">Messaging use cases</h2>
              </div>
              <Show when={brand() && hasAccess("PHONE_WRITE")}>
                <a href={PATH_TEN_DLC_CAMPAIGN_ADD} class="text-sm font-medium text-sky-700">
                  Register campaign
                </a>
              </Show>
            </div>
            <Show when={error()}>
              {(value) => (
                <div class="mt-4">
                  <Alert type="error" layout="inline">
                    {value()}
                  </Alert>
                  <Button class="mt-3" variant="secondary" onClick={() => void load()}>
                    Try again
                  </Button>
                </div>
              )}
            </Show>
            <div class="mt-4 grid gap-3">
              <For
                each={campaigns()}
                fallback={
                  <p class="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
                    No registered campaigns
                  </p>
                }
              >
                {(campaign) => (
                  <article class="rounded-2xl border border-white/80 bg-white/80 p-4">
                    <div class="flex justify-between gap-2">
                      <div>
                        <p class="font-semibold">{campaign.description}</p>
                        <p class="mt-1 text-xs text-slate-500">{campaign.usecase.replaceAll("_", " ")}</p>
                      </div>
                      <span class="text-xs font-medium">{tenDlcStatusLabel(campaign.providerStatus)}</span>
                    </div>
                  </article>
                )}
              </For>
            </div>
            <Show
              when={
                campaigns().some((campaign) => isActiveTenDlcCampaignStatus(campaign.providerStatus)) &&
                hasAccess("PHONE_WRITE")
              }
            >
              <a href={PATH_PHONE_BUY} class="mt-4 inline-block text-sm font-medium text-sky-700">
                Buy a 10DLC number
              </a>
            </Show>
          </Card>
        </div>
      </div>
    </div>
  );
}
