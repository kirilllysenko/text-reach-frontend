<script lang="ts">
  import { ContactExportJobsStore, RequestContactExportStore } from "$houdini";
  import { PATH_CONTACT_EXPORT_HISTORY } from "$lib/app/paths";
  import { createContactJobPoller } from "$lib/feature/contact-job/contact-job-poller.svelte";
  import Download from "text-reach-frontend-library/icons/Download.svelte";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import { onMount } from "svelte";
  import ContactActionDropdown from "../ContactActionDropdown.svelte";
  import { loadContactExportJobs } from "./contact-export-jobs";
  import { buildContactExportRequest, type ContactExportSnapshot } from "./contact-export";
  const notificationsState = getNotificationsState();

  interface Props {
    snapshot: ContactExportSnapshot;
  }

  let { snapshot }: Props = $props();

  const jobsQuery = new ContactExportJobsStore();
  const requestExportMutation = new RequestContactExportStore();
  const jobs = createContactJobPoller({ load: () => loadContactExportJobs(jobsQuery) });
  let requestingExport = $state(false);

  onMount(jobs.start);

  async function requestExport(): Promise<void> {
    if (requestingExport) {
      return;
    }

    requestingExport = true;

    try {
      const response = await requestExportMutation.mutate({ input: buildContactExportRequest(snapshot) });
      if (response.errors || !response.data) {
        throw new Error("Could not request contact export.");
      }

      notificationsState.showInfo("Contact export has been queued.");
      jobs.wake();
    } catch {
      notificationsState.showError("Could not export contacts.");
    } finally {
      requestingExport = false;
    }
  }
</script>

<ContactActionDropdown
  id="contact-export"
  label="Export"
  icon={Download}
  fileLabel="Export File"
  fileIcon={Download}
  historyLabel="Export History"
  activeJobs={requestingExport || jobs.active}
  historyHref={PATH_CONTACT_EXPORT_HISTORY}
  onFile={requestExport}
/>
