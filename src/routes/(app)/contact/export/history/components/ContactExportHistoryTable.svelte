<script lang="ts">
  import ContactJobProgress from "$lib/feature/contact-job/ContactJobProgress.svelte";
  import ContactJobStatusBadge from "$lib/feature/contact-job/ContactJobStatusBadge.svelte";
  import {
    contactExportProgress,
    formatContactJobDate,
    formatFileSize,
    formatRowCount,
  } from "$lib/feature/contact-job/contact-job";
  import Download from "text-reach-frontend-library/icons/Download.svelte";
  import type { ContactExportHistoryJob } from "../contact-export-history";

  interface Props {
    jobs: ContactExportHistoryJob[];
    loading: boolean;
    error: string | null;
    downloadingId: string | null;
    onDownload: (job: ContactExportHistoryJob) => void;
  }

  let { jobs, loading, error, downloadingId, onDownload }: Props = $props();

  function progressDetail(job: ContactExportHistoryJob): string {
    if (job.status === "QUEUED") {
      return "Waiting";
    }

    const rows = `${formatRowCount(job.processedRows)} / ${formatRowCount(job.totalRows)}`;
    return job.totalRows > 0 ? `${rows} (${contactExportProgress(job.processedRows, job.totalRows)}%)` : rows;
  }
</script>

<div class="h-full overflow-auto">
  <table class="w-full min-w-[58rem] border-separate border-spacing-0 text-left text-sm">
    <thead class="sticky top-0 z-10 bg-slate-100 text-xs text-slate-500 uppercase">
      <tr>
        <th class="w-[27%] border-b border-slate-200 px-3 py-3 font-medium">File</th>
        <th class="w-[18%] border-b border-slate-200 px-3 py-3 font-medium">Started</th>
        <th class="w-[14%] border-b border-slate-200 px-3 py-3 font-medium">Status</th>
        <th class="w-[33%] border-b border-slate-200 px-3 py-3 font-medium">Progress</th>
        <th class="w-[8%] border-b border-slate-200 px-3 py-3 font-medium">Size</th>
      </tr>
    </thead>
    <tbody>
      {#if loading && jobs.length === 0}
        {#each Array(5) as _, index (index)}
          <tr>
            <td colspan="5" class="border-b border-slate-100 px-3 py-3">
              <div class="h-9 animate-pulse rounded-lg bg-slate-100"></div>
            </td>
          </tr>
        {/each}
      {:else if error && jobs.length === 0}
        <tr>
          <td colspan="5" class="px-3 py-10 text-center text-sm text-rose-700">{error}</td>
        </tr>
      {:else if jobs.length === 0}
        <tr>
          <td colspan="5" class="px-3 py-10 text-center text-sm text-slate-500"> No exports in the last 30 days. </td>
        </tr>
      {:else}
        {#each jobs as job (job.id)}
          <tr class={job.status === "PROCESSING" || job.status === "QUEUED" ? "bg-sky-50/45" : "bg-white/30"}>
            <td class="max-w-64 border-b border-slate-100 px-3 py-3 font-medium text-slate-700">
              {#if job.status === "COMPLETED"}
                <button
                  class="hover:text-sky-800 flex max-w-full items-center gap-1.5 text-sky-700 hover:cursor-pointer
                    focus-visible:rounded focus-visible:outline-2 focus-visible:outline-sky-500 disabled:cursor-wait"
                  type="button"
                  disabled={downloadingId === job.id}
                  onclick={() => onDownload(job)}
                >
                  <Download class="size-4 shrink-0 fill-current" />
                  <span class="truncate" title={job.filename}>{job.filename}</span>
                </button>
              {:else}
                <span class="block truncate" title={job.filename}>{job.filename}</span>
              {/if}
            </td>
            <td class="border-b border-slate-100 px-3 py-3 text-slate-600">
              {formatContactJobDate(job.startedAt ?? job.createdAt)}
            </td>
            <td class="border-b border-slate-100 px-3 py-3">
              <ContactJobStatusBadge status={job.status} />
            </td>
            <td class="border-b border-slate-100 px-3 py-3">
              <ContactJobProgress
                status={job.status}
                detail={progressDetail(job)}
                progress={contactExportProgress(job.processedRows, job.totalRows)}
              />
            </td>
            <td class="border-b border-slate-100 px-3 py-3 text-slate-600">{formatFileSize(job.fileSize)}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
