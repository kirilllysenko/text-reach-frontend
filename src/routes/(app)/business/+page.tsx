import { createSignal, For, onSettled, Show } from "solid-js";
import { BusinessProfileDocument, type BusinessProfileQuery } from "~/gql/graphql";
import { PATH_BUSINESS_EDIT, PATH_PHONE } from "~/lib/app/paths";
import { Alert, Button, Card, PageTitle } from "~/components";
import { formatPhoneNumber } from "~/lib/feature/phone/phone-display";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";

type BusinessProfile = BusinessProfileQuery["businessProfile"];

const entityTypeLabels = {
  GOVERNMENT: "Government",
  NON_PROFIT: "Non-profit",
  PRIVATE_PROFIT: "Private company",
  PUBLIC_PROFIT: "Public company",
  SOLE_PROPRIETOR: "Sole proprietor",
} as const;

export default function BusinessPage() {
  const [profile, setProfile] = createSignal<BusinessProfile | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [notCreated, setNotCreated] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  onSettled(() => void load());

  async function load(): Promise<void> {
    setLoading(true);
    setNotCreated(false);
    setError(null);
    try {
      const response = await graphqlClient.query(BusinessProfileDocument, {}, { requestPolicy: "network-only" });
      if (response.error) {
        if (graphQLErrorCode(response.error) === "NOT_FOUND") setNotCreated(true);
        else setError("There was an error.");
        return;
      }
      setProfile(response.data?.businessProfile ?? null);
    } catch {
      setError("Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Business information">
        <a
          href={PATH_PHONE}
          class="flex h-9 items-center rounded-xl border border-white/80 bg-white/90 px-3 text-sm font-medium text-slate-700 shadow-sm"
        >
          Phone numbers
        </a>
      </PageTitle>
      <div class="min-h-0 grow overflow-y-auto pb-18">
        <div class="mx-auto max-w-5xl">
          <Show
            when={!error()}
            fallback={
              <Card variant="panel" class="space-y-4 p-5 text-center">
                <Alert type="error" layout="inline">
                  {error()}
                </Alert>
                <Button variant="secondary" onClick={() => void load()}>
                  Try again
                </Button>
              </Card>
            }
          >
            <Show
              when={!loading()}
              fallback={
                <div class="grid gap-3 md:grid-cols-2">
                  <For each={Array.from({ length: 4 })}>{() => <div class="skeleton-loading h-48 rounded-2xl" />}</For>
                </div>
              }
            >
              <Show when={!notCreated() && profile()} keyed fallback={<EmptyBusiness />}>
                {(business) => <BusinessDetails profile={business} />}
              </Show>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
}

function EmptyBusiness() {
  return (
    <Card variant="panel" class="p-10 text-center">
      <h2 class="text-xl font-semibold text-slate-800">Add your business information</h2>
      <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Legal business, address, and authorized-contact details are used when registering and purchasing sending
        numbers.
      </p>
      <a
        id="business-add"
        href={PATH_BUSINESS_EDIT}
        class="mt-5 inline-flex h-9 items-center rounded-xl bg-slate-700 px-3 text-sm font-medium text-white"
      >
        Add business information
      </a>
    </Card>
  );
}

function BusinessDetails(props: { profile: BusinessProfile }) {
  const profile = () => props.profile;
  return (
    <>
      <div class="mb-3 flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-slate-800">{profile().displayName}</h2>
          <p class="mt-1 text-sm text-slate-500">Updated {formatDate(profile().updatedAt)}</p>
        </div>
        <a
          id="business-edit"
          href={PATH_BUSINESS_EDIT}
          class="flex h-9 items-center rounded-xl bg-slate-700 px-3 text-sm font-medium text-white"
        >
          Update information
        </a>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <InfoCard title="Company">
          <Detail label="Legal name" value={profile().legalCompanyName} />
          <Detail label="Entity type" value={entityTypeLabels[profile().entityType]} />
          <Detail label="Industry" value={profile().industry} />
          <Detail label="Registration country" value={profile().registrationCountry} />
        </InfoCard>
        <InfoCard title="Business address">
          <address class="text-sm leading-6 text-slate-700 not-italic">
            {profile().address.street}
            <br />
            {profile().address.city}, {profile().address.region} {profile().address.postalCode}
            <br />
            {profile().address.country}
          </address>
        </InfoCard>
        <InfoCard title="Business contact">
          <Detail label="Email" value={profile().businessEmail} />
          <Detail label="Phone" value={formatPhoneNumber(profile().businessPhone)} />
          <Detail label="Website" value={profile().website} link />
        </InfoCard>
        <InfoCard title="Authorized contact">
          <Detail
            label="Name"
            value={`${profile().authorizedContact.firstName} ${profile().authorizedContact.lastName}`}
          />
          <Detail label="Title" value={profile().authorizedContact.title} />
          <Detail
            label="Contact"
            value={`${profile().authorizedContact.email} · ${formatPhoneNumber(profile().authorizedContact.phone)}`}
          />
        </InfoCard>
        <InfoCard title="Messaging policies" wide>
          <Detail
            label="Privacy policy"
            value={profile().privacyPolicyUrl ?? "Not provided"}
            link={Boolean(profile().privacyPolicyUrl)}
          />
          <Detail
            label="Terms of service"
            value={profile().termsOfServiceUrl ?? "Not provided"}
            link={Boolean(profile().termsOfServiceUrl)}
          />
        </InfoCard>
      </div>
    </>
  );
}

function InfoCard(props: { children: unknown; title: string; wide?: boolean }) {
  return (
    <Card variant="panel" class={props.wide ? "p-5 md:col-span-2" : "p-5"}>
      <h3 class="mb-4 font-semibold text-slate-800">{props.title}</h3>
      <dl class="grid gap-4 sm:grid-cols-2">{props.children as never}</dl>
    </Card>
  );
}

function Detail(props: { label: string; link?: boolean; value: string }) {
  return (
    <div>
      <dt class="text-xs font-medium text-slate-500">{props.label}</dt>
      <dd class="mt-1 text-sm break-words text-slate-800">
        <Show when={props.link} fallback={props.value}>
          <a href={props.value} target="_blank" rel="noreferrer">
            {props.value}
          </a>
        </Show>
      </dd>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
