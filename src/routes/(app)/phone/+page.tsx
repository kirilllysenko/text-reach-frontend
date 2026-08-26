import { createSignal, For, onSettled, Show } from "solid-js";
import { PhoneNumbersDocument, type PhoneNumbersQuery } from "~/gql/graphql";
import { PATH_BUSINESS, PATH_PHONE_BUY, PATH_TEN_DLC } from "~/lib/app/paths";
import { Alert, Button, Card, PageTitle } from "~/components";
import { formatPhoneNumber, phoneTypeLabels } from "~/lib/feature/phone/phone-display";
import { graphqlClient } from "~/lib/graphql/client";
import { hasAccess } from "~/lib/state/session";

type Phone = PhoneNumbersQuery["tenantPhones"]["edges"][number]["node"];

export default function PhonePage() {
  const [phones, setPhones] = createSignal<Phone[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  onSettled(() => void load());
  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const response = await graphqlClient.query(PhoneNumbersDocument, {}, { requestPolicy: "network-only" });
      if (response.error || !response.data) throw new Error();
      setPhones(response.data.tenantPhones.edges.map((edge) => edge.node));
    } catch {
      setError("Could not load phone numbers.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Phone numbers">
        <Show when={hasAccess("PHONE_WRITE")}>
          <a
            href={PATH_PHONE_BUY}
            class="flex h-9 items-center rounded-xl bg-slate-700 px-3 text-sm font-medium text-white"
          >
            Buy a number
          </a>
        </Show>
      </PageTitle>
      <div class="min-h-0 grow overflow-y-auto pb-18">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card variant="panel" class="p-5">
            <h2 class="text-lg font-semibold text-slate-800">Your sending numbers</h2>
            <p class="mt-1 text-sm text-slate-500">Use these numbers for campaigns and conversations.</p>
            <Show
              when={!error()}
              fallback={
                <div class="mt-4">
                  <Alert type="error" layout="inline">
                    {error()}
                  </Alert>
                  <Button class="mt-3" variant="secondary" onClick={() => void load()}>
                    Try again
                  </Button>
                </div>
              }
            >
              <Show when={!loading()} fallback={<div class="skeleton-loading mt-4 h-24 rounded-2xl" />}>
                <Show
                  when={phones().length}
                  fallback={
                    <div class="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                      No phone numbers yet
                    </div>
                  }
                >
                  <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <For each={phones()}>
                      {(phone) => (
                        <article class="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                          <p class="text-lg font-semibold text-slate-800">{formatPhoneNumber(phone.phoneNumber)}</p>
                          <div class="mt-3 flex justify-between">
                            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs">
                              {phoneTypeLabels[phone.phoneType]}
                            </span>
                            <span class="text-xs font-medium text-emerald-700">Active</span>
                          </div>
                        </article>
                      )}
                    </For>
                  </div>
                </Show>
              </Show>
            </Show>
          </Card>
          <Card variant="panel" class="h-fit p-5">
            <Show when={hasAccess("BUSINESS_PROFILE_READ")}>
              <h2 class="text-lg font-semibold">Business information</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">Keep business and authorized-contact details current.</p>
              <a href={PATH_BUSINESS} class="mt-4 block text-sm font-medium text-sky-700">
                Review business information
              </a>
            </Show>
            <div class="mt-5 border-t border-slate-200 pt-5">
              <h2 class="text-lg font-semibold">10DLC registration</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                Register your brand and messaging use case before purchasing a 10DLC number.
              </p>
              <a href={PATH_TEN_DLC} class="mt-4 block text-sm font-medium text-sky-700">
                Manage 10DLC
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
