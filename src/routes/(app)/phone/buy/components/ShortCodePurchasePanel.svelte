<script lang="ts">
  import { resolve } from "$app/paths";
  import type { CreateShortCodeApplicationInput } from "$houdini/graphql/inputs";
  import { Alert } from "$lib";
  import { PATH_PHONE } from "$lib/app/paths";
  import type { FormSubmitResult } from "text-reach-frontend-library/form";
  import type { SubmittedShortCodeApplication } from "./phone-buy-types";
  import ShortCodeApplicationForm from "./short-code/ShortCodeApplicationForm.svelte";

  interface Props {
    businessReady: boolean;
    onSubmit: (input: CreateShortCodeApplicationInput) => Promise<FormSubmitResult>;
    submittedApplication: SubmittedShortCodeApplication | null;
  }

  let { businessReady, onSubmit, submittedApplication }: Props = $props();
</script>

<div>
  <p class="text-xs font-semibold tracking-[0.06em] text-slate-500 uppercase">Step 3</p>
  <h2 class="mt-1 text-lg font-semibold text-slate-800">Apply for a short code</h2>
  <p class="mt-1 text-sm leading-6 text-slate-500">
    Short codes require carrier review. Submit your messaging program and consent details to begin the managed
    registration process.
  </p>
</div>

{#if !businessReady}
  <Alert type="warning" layout="inline" class="mt-4">
    Complete the short-code business requirements in Step 1 before submitting an application.
  </Alert>
{:else if submittedApplication}
  <div id="short-code-application-received" class="bg-emerald-50/90 mt-5 rounded-2xl border border-emerald-200 p-5">
    <p class="text-emerald-900 text-lg font-semibold">Application received</p>
    <p class="text-emerald-800 mt-2 text-sm leading-6">
      Your application was saved for managed review. Purchasing and provisioning happen after carrier approval.
    </p>
    <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <dt class="text-emerald-700">Code preference</dt>
        <dd class="text-emerald-950 mt-1 font-semibold">
          {submittedApplication.shortCodeType === "VANITY"
            ? submittedApplication.requestedShortCode
            : "Carrier assigned"}
        </dd>
      </div>
      <div>
        <dt class="text-emerald-700">Application ID</dt>
        <dd id="short-code-application-id" class="text-emerald-950 mt-1 font-mono text-xs font-semibold break-all">
          {submittedApplication.id}
        </dd>
      </div>
    </dl>
    <a
      href={resolve(PATH_PHONE)}
      class="mt-5 inline-flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700
        px-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
    >
      Return to phone numbers
    </a>
  </div>
{:else}
  <ShortCodeApplicationForm {onSubmit} />
{/if}
