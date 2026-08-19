<script lang="ts">
  import ContactJobProgress from "$lib/feature/contact-job/ContactJobProgress.svelte";
  import ContactJobStatusBadge from "$lib/feature/contact-job/ContactJobStatusBadge.svelte";
  import { formatContactJobDate, formatRowCount } from "$lib/feature/contact-job/contact-job";
  import type { ContactImportHistoryJob } from "../contact-import-history";

  interface Props {
    jobs: ContactImportHistoryJob[];
    loading: boolean;
    error: string | null;
  }

  let { jobs, loading, error }: Props = $props();

  function progressDetail(job: ContactImportHistoryJob): string {
    if (job.status === "QUEUED") {
      return "Waiting";
    }

    return `${formatRowCount(job.processedRows)} processed · ${formatRowCount(job.importedRows)} imported`;
  }
</script>

<div class="h-full overflow-auto">
  <table class="w-full min-w-[50rem] border-separate border-spacing-0 text-left text-sm">
    <thead class="sticky top-0 z-10 bg-slate-100 text-xs text-slate-500 uppercase">
      <tr>
        <th class="w-[28%] border-b border-slate-200 px-3 py-3 font-medium">File</th>
        <th class="w-[20%] border-b border-slate-200 px-3 py-3 font-medium">Started</th>
        <th class="w-[15%] border-b border-slate-200 px-3 py-3 font-medium">Status</th>
        <th class="w-[37%] border-b border-slate-200 px-3 py-3 font-medium">Progress</th>
      </tr>
    </thead>
    <tbody>
      {#if loading && jobs.length === 0}
        {#each Array(5) as _, index (index)}
          <tr>
            <td colspan="4" class="border-b border-slate-100 px-3 py-3">
              <div class="h-9 animate-pulse rounded-lg bg-slate-100"></div>
            </td>
          </tr>
        {/each}
      {:else if error && jobs.length === 0}
        <tr>
          <td colspan="4" class="px-3 py-10 text-center text-sm text-rose-700">{error}</td>
        </tr>
      {:else if jobs.length === 0}
        <tr>
          <td colspan="4" class="px-3 py-10 text-center text-sm text-slate-500"> No imports in the last 30 days. </td>
        </tr>
      {:else}
        {#each jobs as job (job.id)}
          <tr class={job.status === "PROCESSING" || job.status === "QUEUED" ? "bg-sky-50/45" : "bg-white/30"}>
            <td class="max-w-64 border-b border-slate-100 px-3 py-3 font-medium text-slate-700">
              <span class="block truncate" title={job.filename}>{job.filename}</span>
            </td>
            <td class="border-b border-slate-100 px-3 py-3 text-slate-600">
              {formatContactJobDate(job.startedAt ?? job.createdAt)}
            </td>
            <td class="border-b border-slate-100 px-3 py-3">
              <ContactJobStatusBadge status={job.status} />
            </td>
            <td class="border-b border-slate-100 px-3 py-3">
              <ContactJobProgress status={job.status} detail={progressDetail(job)} />
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
