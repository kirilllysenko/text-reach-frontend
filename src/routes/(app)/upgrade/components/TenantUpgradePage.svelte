<script lang="ts">
  import { resolve } from "$app/paths";
  import { Alert, Button, Card, PageTitle } from "$lib";
  import { PATH_BUSINESS, PATH_BUSINESS_EDIT, PATH_DASHBOARD, PATH_UPGRADE } from "$lib/app/paths";
  import {
    formatTrialEnd,
    tenantUpgradeStatus,
    trialTimeText,
  } from "$lib/feature/tenant-upgrade/tenant-upgrade-view-data";
  import { sessionState } from "$lib/state/session.svelte";

  let loading = $state(false);
  const lifecycle = $derived(sessionState.tenantLifecycle);
  const status = $derived(lifecycle ? tenantUpgradeStatus(lifecycle) : null);
  const trialEnd = $derived(lifecycle ? formatTrialEnd(lifecycle.trialEndsAt) : null);
  const statusClasses = $derived.by(() => {
    switch (status?.tone) {
      case "pending":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "rejected":
        return "border-rose-200 bg-rose-50 text-rose-800";
      case "success":
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
      default:
        return "border-sky-200 bg-sky-50 text-sky-800";
    }
  });

  async function reloadLifecycle(): Promise<void> {
    loading = true;
    await sessionState.loadTenantLifecycle();
    loading = false;
  }
</script>

<svelte:head>
  <title>Upgrade to full access | Mega Texting</title>
  <meta name="description" content="Submit your business information and track your Mega Texting full-access review." />
</svelte:head>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Upgrade to full access" />

  <div class="min-h-0 grow overflow-y-auto pb-[max(4.5rem,env(safe-area-inset-bottom))]">
    <div class="mx-auto max-w-5xl space-y-3">
      {#if !lifecycle || !status}
        <Card variant="panel" class="grid min-h-72 place-items-center p-6 text-center sm:p-10">
          <div class="max-w-md">
            <h2 class="text-xl font-semibold text-slate-800">Unable to load upgrade status</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              Check your internet connection, then try loading your tenant status again.
            </p>
            <Button class="mt-5" variant="secondary" spinner={loading} onclick={reloadLifecycle}>Try again</Button>
          </div>
        </Card>
      {:else}
        <Card variant="panel" class="overflow-hidden p-0">
          <div class="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
            <div>
              <span class={["inline-flex rounded-full border px-3 py-1 text-xs font-semibold", statusClasses]}>
                {status.eyebrow}
              </span>
              <h1 class="mt-4 text-2xl font-semibold text-slate-800 sm:text-3xl">{status.title}</h1>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{status.description}</p>

              {#if status.actionPath === "business"}
                <a
                  href={resolve(PATH_BUSINESS)}
                  class="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-700
                    bg-slate-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  {status.actionLabel}
                </a>
              {:else if status.actionPath === "dashboard"}
                <a
                  href={resolve(PATH_DASHBOARD)}
                  class="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-700
                    bg-slate-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  {status.actionLabel}
                </a>
              {:else}
                <a
                  href={resolve(`${PATH_BUSINESS_EDIT}?returnTo=${encodeURIComponent(PATH_UPGRADE)}`)}
                  class="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-700
                    bg-slate-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  {status.actionLabel}
                </a>
              {/if}
            </div>

            {#if lifecycle.accessMode === "TRIAL"}
              <div class="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Free trial</p>
                <p class="mt-2 text-lg font-semibold text-slate-800">{trialTimeText(lifecycle.trialEndsAt)}</p>
                {#if trialEnd}
                  <p class="mt-1 text-xs leading-5 text-slate-500">Ends {trialEnd}</p>
                {/if}
                <p class="mt-3 text-xs leading-5 text-slate-600">
                  Full access removes the trial expiration after an administrator approves your business.
                </p>
              </div>
            {:else}
              <Alert type="success" layout="inline" class="p-4">
                Your tenant has full access and does not expire with the original trial date.
              </Alert>
            {/if}
          </div>
        </Card>

        <Card variant="panel" class="p-5 sm:p-7">
          <h2 class="text-lg font-semibold text-slate-800">How upgrading works</h2>
          <ol class="mt-5 grid gap-3 lg:grid-cols-3">
            <li class="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
              <span class="text-sky-800 grid size-8 place-items-center rounded-full bg-sky-100 text-sm font-semibold">
                1
              </span>
              <h3 class="mt-3 font-semibold text-slate-800">Submit business details</h3>
              <p class="mt-1 text-sm leading-6 text-slate-500">
                Provide your legal company, address, tax, and authorized-contact information.
              </p>
            </li>
            <li class="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
              <span class="text-sky-800 grid size-8 place-items-center rounded-full bg-sky-100 text-sm font-semibold">
                2
              </span>
              <h3 class="mt-3 font-semibold text-slate-800">Business review</h3>
              <p class="mt-1 text-sm leading-6 text-slate-500">
                An administrator reviews the exact version of the business profile you submitted.
              </p>
            </li>
            <li class="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
              <span class="text-sky-800 grid size-8 place-items-center rounded-full bg-sky-100 text-sm font-semibold">
                3
              </span>
              <h3 class="mt-3 font-semibold text-slate-800">Full access activation</h3>
              <p class="mt-1 text-sm leading-6 text-slate-500">
                Approval verifies the submitted profile and permanently removes the trial expiration.
              </p>
            </li>
          </ol>
        </Card>

        {#if lifecycle.accessMode === "TRIAL" && lifecycle.businessVerification === "PENDING"}
          <Alert type="warning" layout="inline" class="p-4">
            Updating your business information submits a new profile version. Only make changes if the submitted details
            are no longer accurate or an administrator asks you to update them.
          </Alert>
        {/if}
      {/if}
    </div>
  </div>
</div>
