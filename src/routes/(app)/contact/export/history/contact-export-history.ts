import type { ContactExportHistoryStore } from "$houdini";
import type { ContactExportHistory$result } from "$houdini/artifacts/ContactExportHistory";
import { contactJobCutoff } from "$lib/feature/contact-job/contact-job";

const JOB_PAGE_SIZE = 100;

export type ContactExportHistoryJob = ContactExportHistory$result["contactExports"]["edges"][number]["node"];
type ContactExportHistoryResponse = Awaited<ReturnType<ContactExportHistoryStore["fetch"]>>;

export async function loadContactExportHistory(query: ContactExportHistoryStore): Promise<ContactExportHistoryJob[]> {
  const jobs: ContactExportHistoryJob[] = [];
  const cutoff = contactJobCutoff();
  let after: string | null = null;

  while (true) {
    const response: ContactExportHistoryResponse = await query.fetch({
      variables: {
        after,
        first: JOB_PAGE_SIZE,
        sortBy: [{ createdAt: { direction: "DESC" } }],
      },
    });

    if (response.errors || !response.data) {
      throw new Error("Could not load contact exports.");
    }

    const connection: ContactExportHistory$result["contactExports"] = response.data.contactExports;
    const pageJobs: ContactExportHistoryJob[] = connection.edges.map((edge) => edge.node);
    jobs.push(...pageJobs.filter((job) => Date.parse(job.createdAt) >= cutoff));

    const oldestJob = pageJobs.at(-1);
    if (!connection.pageInfo.hasNextPage || !connection.pageInfo.endCursor || !oldestJob) {
      break;
    }
    if (Date.parse(oldestJob.createdAt) < cutoff) {
      break;
    }

    after = connection.pageInfo.endCursor;
  }

  return jobs;
}
