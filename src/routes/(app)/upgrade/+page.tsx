import { Title } from "@solidjs/meta";
import { createMemo, createSignal, Show } from "solid-js";
import { PATH_BUSINESS, PATH_BUSINESS_EDIT, PATH_DASHBOARD, PATH_UPGRADE } from "~/lib/app/paths";
import { Alert, Button, Card, PageTitle } from "~/components";
import { classes } from "~/lib/styles/classes";
import { loadTenantLifecycle, session } from "~/lib/state/session";

type Lifecycle = NonNullable<typeof session.tenantLifecycle>;

export default function UpgradePage() {
  const [loading, setLoading] = createSignal(false);
  const status = createMemo(() => (session.tenantLifecycle ? upgradeStatus(session.tenantLifecycle) : null));

  async function reload(): Promise<void> {
    setLoading(true);
    await loadTenantLifecycle();
    setLoading(false);
  }

  return (
    <>
      <Title>Upgrade to full access | Text Reach</Title>
      <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
        <PageTitle title="Upgrade to full access" />
        <div class="min-h-0 grow overflow-y-auto pb-18">
          <div class="mx-auto max-w-5xl space-y-3">
            <Show
              when={session.tenantLifecycle && status()}
              keyed
              fallback={
                <Card variant="panel" class="grid min-h-72 place-items-center p-10 text-center">
                  <div>
                    <h2 class="text-xl font-semibold text-slate-800">Unable to load upgrade status</h2>
                    <p class="mt-2 text-sm text-slate-500">Check your connection and load your tenant status again.</p>
                    <Button class="mt-5" variant="secondary" spinner={loading()} onClick={() => void reload()}>
                      Try again
                    </Button>
                  </div>
                </Card>
              }
            >
              {(view) => (
                <>
                  <Card variant="panel" class="overflow-hidden p-0">
                    <div class="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_17rem]">
                      <div>
                        <span
                          class={classes([
                            "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                            toneClasses(view.tone),
                          ])}
                        >
                          {view.eyebrow}
                        </span>
                        <h1 class="mt-4 text-2xl font-semibold text-slate-800 sm:text-3xl">{view.title}</h1>
                        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{view.description}</p>
                        <a
                          href={actionHref(view.actionPath)}
                          class="mt-5 inline-flex min-h-10 items-center rounded-xl bg-slate-700 px-4 text-sm font-medium text-white"
                        >
                          {view.actionLabel}
                        </a>
                      </div>
                      <Show
                        when={session.tenantLifecycle?.accessMode === "TRIAL"}
                        fallback={
                          <Alert type="success" layout="inline">
                            Full access is active and does not expire.
                          </Alert>
                        }
                      >
                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p class="text-xs font-semibold text-slate-500 uppercase">Free trial</p>
                          <p class="mt-2 text-lg font-semibold text-slate-800">
                            {trialTimeText(session.tenantLifecycle!.trialEndsAt)}
                          </p>
                          <p class="mt-1 text-xs text-slate-500">
                            Ends {formatDate(session.tenantLifecycle!.trialEndsAt)}
                          </p>
                        </div>
                      </Show>
                    </div>
                  </Card>
                  <Card variant="panel" class="p-5 sm:p-7">
                    <h2 class="text-lg font-semibold text-slate-800">How upgrading works</h2>
                    <ol class="mt-5 grid gap-3 lg:grid-cols-3">
                      <Step number="1" title="Submit business details">
                        Provide legal company, address, tax, and contact information.
                      </Step>
                      <Step number="2" title="Business review">
                        An administrator reviews the submitted profile.
                      </Step>
                      <Step number="3" title="Full access activation">
                        Approval permanently removes the trial expiration.
                      </Step>
                    </ol>
                  </Card>
                  <Show
                    when={
                      session.tenantLifecycle?.accessMode === "TRIAL" &&
                      session.tenantLifecycle.businessVerification === "PENDING"
                    }
                  >
                    <Alert type="warning" layout="inline" class="p-4">
                      Updating your business information submits a new profile version. Only make changes if the
                      submitted details are no longer accurate or an administrator asks you to update them.
                    </Alert>
                  </Show>
                </>
              )}
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}

function Step(props: { children: unknown; number: string; title: string }) {
  return (
    <li class="rounded-2xl border border-slate-200 bg-white/70 p-4">
      <span class="text-sky-800 grid size-8 place-items-center rounded-full bg-sky-100 text-sm font-semibold">
        {props.number}
      </span>
      <h3 class="mt-3 font-semibold text-slate-800">{props.title}</h3>
      <p class="mt-1 text-sm leading-6 text-slate-500">{props.children as never}</p>
    </li>
  );
}

function upgradeStatus(lifecycle: Lifecycle) {
  if (lifecycle.accessMode === "FULL")
    return {
      eyebrow: "Upgrade complete",
      title: "Full access is active",
      description: "Your business is verified and your workspace no longer has a trial expiration.",
      actionLabel: "Go to dashboard",
      actionPath: "dashboard" as const,
      tone: "success" as const,
    };
  if (lifecycle.businessVerification === "PENDING")
    return {
      eyebrow: "Step 2 of 3",
      title: "Your business is under review",
      description: "Your submitted business information is ready for an administrator to review.",
      actionLabel: "Review submitted details",
      actionPath: "business" as const,
      tone: "pending" as const,
    };
  if (lifecycle.businessVerification === "REJECTED")
    return {
      eyebrow: "Action required",
      title: "Update your business information",
      description: "Review the submitted details, make corrections, and resubmit for review.",
      actionLabel: "Update and resubmit",
      actionPath: "business-edit" as const,
      tone: "rejected" as const,
    };
  if (lifecycle.businessVerification === "VERIFIED")
    return {
      eyebrow: "Step 3 of 3",
      title: "Activation is in progress",
      description: "Your business is verified. An administrator still needs to activate full access.",
      actionLabel: "Review business details",
      actionPath: "business" as const,
      tone: "pending" as const,
    };
  return {
    eyebrow: "Step 1 of 3",
    title: "Submit your business information",
    description: "Tell us about your legal business and authorized contact to start review.",
    actionLabel: "Start upgrade",
    actionPath: "business-edit" as const,
    tone: "neutral" as const,
  };
}

function actionHref(action: "business" | "business-edit" | "dashboard"): string {
  if (action === "business") return PATH_BUSINESS;
  if (action === "dashboard") return PATH_DASHBOARD;
  return `${PATH_BUSINESS_EDIT}?returnTo=${encodeURIComponent(PATH_UPGRADE)}`;
}
function toneClasses(tone: string): string {
  if (tone === "pending") return "border-amber-200 bg-amber-50 text-amber-800";
  if (tone === "rejected") return "border-rose-200 bg-rose-50 text-rose-800";
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}
function trialTimeText(value: string): string {
  const end = new Date(value);
  if (Number.isNaN(end.getTime())) return "Trial expiration unavailable";
  const hours = Math.ceil((end.getTime() - Date.now()) / 3_600_000);
  if (hours <= 0) return "Trial ended";
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} remaining`;
  const days = Math.ceil(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} remaining`;
}
function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
