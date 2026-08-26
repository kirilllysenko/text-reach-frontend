import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, For, onSettled, Show } from "solid-js";
import {
  AvailablePhoneNumbersDocument,
  BuyPhoneNumberDocument,
  CreateShortCodeApplicationDocument,
  PhonePurchaseBusinessProfileDocument,
  PhonePurchaseTenDlcCampaignsDocument,
  type AvailablePhoneNumbersQuery,
  type CreateShortCodeApplicationInput,
  type PhonePurchaseBusinessProfileQuery,
  type PhonePurchaseTenDlcCampaignsQuery,
  type PhoneType,
} from "~/gql/graphql";
import { PATH_BUSINESS_EDIT, PATH_PAYMENT_TOP_UP, PATH_PHONE, PATH_TEN_DLC } from "~/lib/app/paths";
import { Alert, Button, Card, Input, PageTitle } from "~/components";
import { formatPhoneNumber, isActiveTenDlcCampaignStatus, phoneTypeLabels } from "~/lib/feature/phone/phone-display";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { showInfo } from "~/lib/state/notifications";
import { ShortCodeForm } from "./components/ShortCodeForm";
type AvailablePhone = AvailablePhoneNumbersQuery["availableTenantPhones"][number];
type Business = PhonePurchaseBusinessProfileQuery["businessProfile"];
type TenDlcCampaign = PhonePurchaseTenDlcCampaignsQuery["tenDlcCampaigns"]["edges"][number]["node"];
export default function PhoneBuyPage() {
  const navigate = useNavigate();
  const [type, setType] = createSignal<PhoneType>("TOLL_FREE");
  const [business, setBusiness] = createSignal<Business | null>(null);
  const [phones, setPhones] = createSignal<AvailablePhone[]>([]);
  const [selected, setSelected] = createSignal<AvailablePhone | null>(null);
  const [campaigns, setCampaigns] = createSignal<TenDlcCampaign[]>([]);
  const [campaignId, setCampaignId] = createSignal("");
  const [search, setSearch] = createSignal("");
  const [checking, setChecking] = createSignal(true);
  const [searching, setSearching] = createSignal(false);
  const [buying, setBuying] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [submittedApplication, setSubmittedApplication] = createSignal<{
    id: string;
    requestedShortCode: string | null;
    shortCodeType: string;
  } | null>(null);
  const shortCodeReady = createMemo(() =>
    Boolean(
      business()?.hasTaxId &&
      business()?.businessRegistrationType?.trim() &&
      business()?.taxIdIssuingCountry?.trim() &&
      business()?.privacyPolicyUrl?.trim() &&
      business()?.termsOfServiceUrl?.trim() &&
      business()?.website.trim(),
    ),
  );
  const activeCampaigns = createMemo(() =>
    campaigns().filter((campaign) => isActiveTenDlcCampaignStatus(campaign.providerStatus)),
  );
  onSettled(() => void initialize());
  async function initialize(): Promise<void> {
    setChecking(true);
    try {
      const response = await graphqlClient.query(
        PhonePurchaseBusinessProfileDocument,
        {},
        { requestPolicy: "network-only" },
      );
      setBusiness(!response.error ? (response.data?.businessProfile ?? null) : null);
      if (!response.error && response.data?.businessProfile) await searchPhones("TOLL_FREE");
    } finally {
      setChecking(false);
    }
  }
  async function selectType(next: PhoneType): Promise<void> {
    setType(next);
    setPhones([]);
    setSelected(null);
    setError(null);
    if (next === "TEN_DLC") {
      await loadCampaigns();
      if (campaignId()) await searchPhones(next);
    } else if (next !== "SHORT_CODE") await searchPhones(next);
  }
  async function loadCampaigns(): Promise<void> {
    try {
      const response = await graphqlClient.query(
        PhonePurchaseTenDlcCampaignsDocument,
        {},
        { requestPolicy: "network-only" },
      );
      if (response.error || !response.data) throw new Error();
      const next = response.data.tenDlcCampaigns.edges.map((edge) => edge.node);
      setCampaigns(next);
      setCampaignId(next.find((campaign) => isActiveTenDlcCampaignStatus(campaign.providerStatus))?.id ?? "");
    } catch {
      setError("Could not load 10DLC campaigns.");
    }
  }
  async function searchPhones(phoneType = type()): Promise<void> {
    if (!business() || phoneType === "SHORT_CODE" || (phoneType === "TEN_DLC" && !campaignId())) return;
    setSearching(true);
    setError(null);
    try {
      const response = await graphqlClient.query(
        AvailablePhoneNumbersDocument,
        { input: { number: search().replace(/\D/g, "") || null, phoneType } },
        { requestPolicy: "network-only" },
      );
      if (response.error || !response.data) throw new Error();
      setPhones([...response.data.availableTenantPhones]);
    } catch {
      setPhones([]);
      setError("Could not search available numbers.");
    } finally {
      setSearching(false);
    }
  }
  async function buy(): Promise<void> {
    const phone = selected();
    if (!phone || buying()) return;
    setBuying(true);
    setError(null);
    try {
      const response = await graphqlClient.mutation(BuyPhoneNumberDocument, {
        input: {
          number: phone.phoneNumber,
          phoneType: phone.phoneType,
          ...(phone.phoneType === "TEN_DLC" ? { tenDlcCampaignId: campaignId() } : {}),
        },
      });
      if (response.error || !response.data) {
        const code = graphQLErrorCode(response.error);
        setError(
          code === "INSUFFICIENT_FUNDS"
            ? "Your available balance is too low to purchase this number."
            : code === "NOT_FOUND"
              ? "This number is no longer available."
              : "Could not purchase this number.",
        );
        setSelected(null);
        return;
      }
      showInfo(`${formatPhoneNumber(response.data.buyTenantPhone.phoneNumber)} is ready to use.`);
      navigate(PATH_PHONE);
    } catch {
      setError("Could not purchase this number.");
    } finally {
      setBuying(false);
    }
  }
  async function submitShortCode(input: CreateShortCodeApplicationInput): Promise<boolean> {
    try {
      const response = await graphqlClient.mutation(CreateShortCodeApplicationDocument, { input });
      const result = response.data?.createShortCodeApplication;
      if (response.error || !result) {
        setError("Could not submit short code application.");
        return false;
      }
      setSubmittedApplication(result);
      showInfo("Short code application has been submitted.");
      return true;
    } catch {
      setError("Could not submit short code application.");
      return false;
    }
  }
  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Buy a phone number">
        <a href={PATH_PHONE} class="text-sm font-medium text-sky-700">
          Phone numbers
        </a>
      </PageTitle>
      <div class="min-h-0 grow overflow-y-auto pb-18">
        <div class="mx-auto grid max-w-5xl gap-3 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside class="space-y-3">
            <Card variant="panel" class="p-4">
              <p class="text-xs font-semibold text-slate-500 uppercase">Step 1</p>
              <h2 class="mt-1 font-semibold">Business information</h2>
              <Show when={!checking()} fallback={<div class="skeleton-loading mt-3 h-16 rounded-xl" />}>
                <Show
                  when={business()}
                  fallback={
                    <>
                      <Alert type="warning" layout="inline" class="mt-3">
                        Add business information before choosing a number.
                      </Alert>
                      <a
                        href={`${PATH_BUSINESS_EDIT}?returnTo=%2Fphone%2Fbuy`}
                        class="mt-3 block text-sm font-medium text-sky-700"
                      >
                        Add business information
                      </a>
                    </>
                  }
                >
                  <p class="mt-3 rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
                    {business()?.displayName} is ready.
                  </p>
                </Show>
              </Show>
            </Card>
            <Card variant="panel" class="p-4">
              <p class="text-xs font-semibold text-slate-500 uppercase">Step 2</p>
              <h2 class="mt-1 font-semibold">Choose number type</h2>
              <div class="mt-3 grid gap-2">
                <For each={["TOLL_FREE", "TEN_DLC", "SHORT_CODE"] as PhoneType[]}>
                  {(phoneType) => (
                    <Button
                      variant="secondary"
                      active={type() === phoneType}
                      disabled={!business()}
                      onClick={() => void selectType(phoneType)}
                    >
                      {phoneTypeLabels[phoneType]}
                    </Button>
                  )}
                </For>
              </div>
            </Card>
          </aside>
          <Card variant="panel" class="p-5">
            <p class="text-xs font-semibold text-slate-500 uppercase">Step 3</p>
            <Show
              when={type() === "SHORT_CODE"}
              fallback={
                <>
                  <h2 class="mt-1 text-lg font-semibold">Find an available number</h2>
                  <Show when={type() === "TEN_DLC"}>
                    <div class="mt-4 rounded-xl bg-sky-50 p-3">
                      <Show
                        when={activeCampaigns().length}
                        fallback={
                          <p class="text-sm">
                            An approved campaign is required. <a href={PATH_TEN_DLC}>Manage 10DLC</a>
                          </p>
                        }
                      >
                        <label class="text-sm font-medium">
                          Approved campaign
                          <select
                            class="glass-input mt-1 h-10 w-full px-3"
                            value={campaignId()}
                            onChange={(event) => setCampaignId(event.currentTarget.value)}
                          >
                            <For each={activeCampaigns()}>
                              {(campaign) => <option value={campaign.id}>{campaign.description}</option>}
                            </For>
                          </select>
                        </label>
                      </Show>
                    </div>
                  </Show>
                  <form
                    class="mt-4 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void searchPhones();
                    }}
                  >
                    <Input
                      inputmode="numeric"
                      maxlength={10}
                      placeholder="Area code or digits"
                      value={search()}
                      onInput={(event) => setSearch(event.currentTarget.value)}
                    />
                    <Button submit spinner={searching()}>
                      Search
                    </Button>
                  </form>
                  <Show when={error()}>
                    {(value) => (
                      <Alert type="error" layout="inline" class="mt-4">
                        {value()}
                        <Show when={value().startsWith("Your available balance")}>
                          <a href={PATH_PAYMENT_TOP_UP} class="ml-1 underline">
                            Top up
                          </a>
                        </Show>
                      </Alert>
                    )}
                  </Show>
                  <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <For
                      each={phones()}
                      fallback={
                        <Show when={!searching()}>
                          <p class="text-sm text-slate-500">No matching numbers.</p>
                        </Show>
                      }
                    >
                      {(phone) => (
                        <article class="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">
                          <div class="grow">
                            <p class="font-semibold">{formatPhoneNumber(phone.phoneNumber)}</p>
                            <p class="text-xs text-slate-500">{phoneTypeLabels[phone.phoneType]}</p>
                          </div>
                          <Button small onClick={() => setSelected(phone)}>
                            Buy
                          </Button>
                        </article>
                      )}
                    </For>
                  </div>
                </>
              }
            >
              <h2 class="mt-1 text-lg font-semibold">Apply for a short code</h2>
              <Show
                when={shortCodeReady()}
                fallback={
                  <Alert type="warning" layout="inline" class="mt-4">
                    Complete tax, registration, policy, terms, and website details first.
                  </Alert>
                }
              >
                <Show when={submittedApplication()} fallback={<ShortCodeForm onSubmit={submitShortCode} />}>
                  {(application) => (
                    <div class="bg-emerald-50 mt-5 rounded-2xl border border-emerald-200 p-5">
                      <h3 class="text-emerald-900 text-lg font-semibold">Application received</h3>
                      <p class="text-emerald-800 mt-2 text-sm">Application ID: {application().id}</p>
                      <a href={PATH_PHONE} class="mt-4 block text-sm font-medium">
                        Return to phone numbers
                      </a>
                    </div>
                  )}
                </Show>
              </Show>
            </Show>
          </Card>
        </div>
      </div>
      <Show when={selected()}>
        {(phone) => (
          <div class="fixed inset-0 z-60 flex items-center justify-center">
            <button
              class="absolute inset-0 bg-slate-900/35"
              aria-label="Cancel purchase"
              onClick={() => setSelected(null)}
            />
            <div class="relative z-10 mx-3 rounded-2xl bg-white p-5 shadow-xl">
              <h2 class="text-lg font-semibold">Confirm phone purchase</h2>
              <p class="mt-3 text-xl font-semibold">{formatPhoneNumber(phone().phoneNumber)}</p>
              <div class="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSelected(null)}>
                  Cancel
                </Button>
                <Button spinner={buying()} onClick={() => void buy()}>
                  Confirm purchase
                </Button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
