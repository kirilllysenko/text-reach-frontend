<script lang="ts">
  import { ContactImportHistoryStore } from "$houdini";
  import { BackButton, Card, PageTitle } from "$lib";
  import { createContactJobPoller } from "$lib/feature/contact-job/contact-job-poller.svelte";
  import { onMount } from "svelte";
  import { loadContactImportHistory } from "./contact-import-history";
  import ContactImportHistoryTable from "./components/ContactImportHistoryTable.svelte";

  const historyQuery = new ContactImportHistoryStore();
  const history = createContactJobPoller({ load: () => loadContactImportHistory(historyQuery) });

  onMount(history.start);
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Import history">
    <BackButton>Contacts</BackButton>
  </PageTitle>

  <p class="shrink-0 text-sm text-slate-500">Last 30 days</p>

  <Card variant="table">
    <ContactImportHistoryTable jobs={history.jobs} loading={history.loading} error={history.error} />
  </Card>
</div>
