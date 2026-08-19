<script lang="ts">
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import { BusinessProfileStore } from "$houdini";
  import { Alert, Button, Card, PageTitle } from "$lib";
  import { PATH_BUSINESS_EDIT, PATH_PHONE } from "$lib/app/paths";
  import { formatPhoneNumber } from "$lib/feature/phone/phone-display";
  import { graphQLErrorCode } from "$lib/graphql/errors";

  const entityTypeLabels = {
    GOVERNMENT: "Government",
    NON_PROFIT: "Non-profit",
    PRIVATE_PROFIT: "Private company",
    PUBLIC_PROFIT: "Public company",
    SOLE_PROPRIETOR: "Sole proprietor",
  } as const;

  const businessProfileQuery = new BusinessProfileStore();
  let loading = $state(true);
  let notCreated = $state(false);
  let loadError = $state<string | null>(null);
  const profile = $derived($businessProfileQuery.data?.businessProfile ?? null);

  onMount(() => {
    void loadProfile();
  });

  async function loadProfile(): Promise<void> {
    loading = true;
    notCreated = false;
    loadError = null;

    try {
      const response = await businessProfileQuery.fetch();
      if (response.errors) {
        notCreated = graphQLErrorCode(response.errors) === "NOT_FOUND";
        if (!notCreated) {
          loadError = "There was an error.";
        }
      }
    } catch {
      loadError = "Please check your internet connection and try again.";
    } finally {
      loading = false;
    }
  }

  function formatUpdatedAt(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Business information">
    <a
      href={resolve(PATH_PHONE)}
      class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-3
        text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
    >
      Phone numbers
    </a>
  </PageTitle>

  <div class="min-h-0 grow overflow-y-auto pb-[max(4.5rem,env(safe-area-inset-bottom))]">
    <div class="mx-auto max-w-5xl">
      {#if loadError}
        <Card variant="panel" class="space-y-4 p-5 text-center">
          <Alert type="error" layout="inline">{loadError}</Alert>
          <Button variant="secondary" onclick={loadProfile}>Try again</Button>
        </Card>
      {:else if loading}
        <div class="grid gap-3 md:grid-cols-2">
          {#each Array(4) as _, index (index)}
            <div class="skeleton-loading h-48 rounded-2xl"></div>
          {/each}
        </div>
      {:else if notCreated || !profile}
        <Card variant="panel" class="p-6 text-center sm:p-10">
          <div class="mx-auto max-w-xl">
            <h2 class="text-xl font-semibold text-slate-800">Add your business information</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              Legal business, address, and authorized-contact details are used when registering and purchasing sending
              numbers.
            </p>
            <a
              href={resolve(PATH_BUSINESS_EDIT)}
              class="mt-5 inline-flex h-9 items-center justify-center rounded-xl border border-slate-700
                bg-slate-700 px-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Add business information
            </a>
          </div>
        </Card>
      {:else}
        <div
          class="mb-3 flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm sm:flex-row
          sm:items-center sm:justify-between"
        >
          <div>
            <h2 class="text-xl font-semibold text-slate-800">{profile.displayName}</h2>
            <p class="mt-1 text-sm text-slate-500">Updated {formatUpdatedAt(profile.updatedAt)}</p>
          </div>
          <a
            href={resolve(PATH_BUSINESS_EDIT)}
            class="flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700 px-3
              text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Update information
          </a>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <Card variant="panel" class="p-5">
            <h3 class="font-semibold text-slate-800">Company</h3>
            <dl class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-medium text-slate-500">Legal name</dt>
                <dd class="mt-1 text-sm text-slate-800">{profile.legalCompanyName}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500">Entity type</dt>
                <dd class="mt-1 text-sm text-slate-800">{entityTypeLabels[profile.entityType]}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500">Industry</dt>
                <dd class="mt-1 text-sm text-slate-800">{profile.industry}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500">Registration country</dt>
                <dd class="mt-1 text-sm text-slate-800">{profile.registrationCountry}</dd>
              </div>
              {#if profile.hasTaxId}
                <div>
                  <dt class="text-xs font-medium text-slate-500">Tax ID</dt>
                  <dd class="mt-1 text-sm text-slate-800">Ending in {profile.taxIdLastFour}</dd>
                </div>
              {/if}
            </dl>
          </Card>

          <Card variant="panel" class="p-5">
            <h3 class="font-semibold text-slate-800">Business address</h3>
            <address class="mt-4 text-sm leading-6 text-slate-700 not-italic">
              {profile.address.street}<br />
              {profile.address.city}, {profile.address.region}
              {profile.address.postalCode}<br />
              {profile.address.country}
            </address>
          </Card>

          <Card variant="panel" class="p-5">
            <h3 class="font-semibold text-slate-800">Business contact</h3>
            <dl class="mt-4 space-y-4">
              <div>
                <dt class="text-xs font-medium text-slate-500">Email</dt>
                <dd class="mt-1 text-sm text-slate-800">{profile.businessEmail}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500">Phone</dt>
                <dd class="mt-1 text-sm text-slate-800">{formatPhoneNumber(profile.businessPhone)}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500">Website</dt>
                <dd class="mt-1 truncate text-sm">
                  <a {...{ href: profile.website }} target="_blank" rel="noreferrer">{profile.website}</a>
                </dd>
              </div>
            </dl>
          </Card>

          <Card variant="panel" class="p-5">
            <h3 class="font-semibold text-slate-800">Authorized contact</h3>
            <dl class="mt-4 space-y-4">
              <div>
                <dt class="text-xs font-medium text-slate-500">Name</dt>
                <dd class="mt-1 text-sm text-slate-800">
                  {profile.authorizedContact.firstName}
                  {profile.authorizedContact.lastName}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500">Title</dt>
                <dd class="mt-1 text-sm text-slate-800">{profile.authorizedContact.title}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-slate-500">Contact</dt>
                <dd class="mt-1 text-sm text-slate-800">
                  {profile.authorizedContact.email} · {formatPhoneNumber(profile.authorizedContact.phone)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card variant="panel" class="p-5 md:col-span-2">
            <h3 class="font-semibold text-slate-800">Messaging policies</h3>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-xs font-medium text-slate-500">Privacy policy</p>
                {#if profile.privacyPolicyUrl}
                  <a
                    {...{ href: profile.privacyPolicyUrl }}
                    class="mt-1 block truncate text-sm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {profile.privacyPolicyUrl}
                  </a>
                {:else}
                  <p class="mt-1 text-sm text-slate-500">Not provided</p>
                {/if}
              </div>
              <div>
                <p class="text-xs font-medium text-slate-500">Terms of service</p>
                {#if profile.termsOfServiceUrl}
                  <a
                    {...{ href: profile.termsOfServiceUrl }}
                    class="mt-1 block truncate text-sm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {profile.termsOfServiceUrl}
                  </a>
                {:else}
                  <p class="mt-1 text-sm text-slate-500">Not provided</p>
                {/if}
              </div>
            </div>
          </Card>
        </div>
      {/if}
    </div>
  </div>
</div>
