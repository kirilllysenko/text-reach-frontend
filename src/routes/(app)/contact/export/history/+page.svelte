<script lang="ts">
  import { ContactExportHistoryDownloadUrlStore, ContactExportHistoryStore } from "$houdini";
  import { BackButton, Card, PageTitle } from "$lib";
  import { createContactJobPoller } from "$lib/feature/contact-job/contact-job-poller.svelte";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { onMount } from "svelte";
  import { loadContactExportHistory, type ContactExportHistoryJob } from "./contact-export-history";
  import ContactExportHistoryTable from "./components/ContactExportHistoryTable.svelte";
  const notificationsState = getNotificationsState();

  const historyQuery = new ContactExportHistoryStore();
  const downloadUrlQuery = new ContactExportHistoryDownloadUrlStore();
  const history = createContactJobPoller({ load: () => loadContactExportHistory(historyQuery) });
  let downloadingId = $state<string | null>(null);

  onMount(history.start);

  async function downloadExport(job: ContactExportHistoryJob): Promise<void> {
    if (downloadingId) {
      return;
    }

    downloadingId = job.id;

    try {
      const response = await downloadUrlQuery.fetch({ variables: { id: job.id } });
      const url = response.data?.contactExportDownloadUrl.url;
      if (response.errors || !url) {
        throw new Error("Could not load the export file.");
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = job.filename;
      link.rel = "noopener";
      link.click();
    } catch {
      notificationsState.showError("Could not download the export file.");
    } finally {
      downloadingId = null;
    }
  }
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Export history">
    <BackButton>Contacts</BackButton>
  </PageTitle>

  <p class="shrink-0 text-sm text-slate-500">Last 30 days</p>

  <Card variant="table">
    <ContactExportHistoryTable
      jobs={history.jobs}
      loading={history.loading}
      error={history.error}
      {downloadingId}
      onDownload={downloadExport}
    />
  </Card>
</div>
