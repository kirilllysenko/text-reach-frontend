<script lang="ts">
  import { ContactImportJobsStore } from "$houdini";
  import { PATH_CONTACT_IMPORT, PATH_CONTACT_IMPORT_HISTORY } from "$lib/app/paths";
  import { createContactJobPoller } from "$lib/feature/contact-job/contact-job-poller.svelte";
  import Upload from "text-reach-frontend-library/icons/Upload.svelte";
  import { onMount } from "svelte";
  import ContactActionDropdown from "../ContactActionDropdown.svelte";
  import { loadContactImportJobs } from "./contact-import-jobs";

  interface Props {
    onImported: () => Promise<void> | void;
  }

  let { onImported }: Props = $props();

  const jobsQuery = new ContactImportJobsStore();
  const jobs = createContactJobPoller({
    load: () => loadContactImportJobs(jobsQuery),
    onCompleted: () => onImported(),
  });

  onMount(jobs.start);
</script>

<ContactActionDropdown
  id="contact-import"
  label="Import"
  icon={Upload}
  fileLabel="Import File"
  fileIcon={Upload}
  historyLabel="Import History"
  activeJobs={jobs.active}
  fileHref={PATH_CONTACT_IMPORT}
  historyHref={PATH_CONTACT_IMPORT_HISTORY}
/>
