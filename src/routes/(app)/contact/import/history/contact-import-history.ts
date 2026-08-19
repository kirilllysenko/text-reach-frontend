import type { ContactImportHistoryStore } from "$houdini";
import type { ContactImportHistory$result } from "$houdini/artifacts/ContactImportHistory";
import { contactJobCutoff } from "$lib/feature/contact-job/contact-job";

const JOB_PAGE_SIZE = 100;

export type ContactImportHistoryJob = ContactImportHistory$result["contactImports"]["edges"][number]["node"];
type ContactImportHistoryResponse = Awaited<ReturnType<ContactImportHistoryStore["fetch"]>>;

export async function loadContactImportHistory(query: ContactImportHistoryStore): Promise<ContactImportHistoryJob[]> {
  const jobs: ContactImportHistoryJob[] = [];
  const cutoff = contactJobCutoff();
  let after: string | null = null;

  while (true) {
    const response: ContactImportHistoryResponse = await query.fetch({
      variables: {
        after,
        first: JOB_PAGE_SIZE,
        sortBy: [{ createdAt: { direction: "DESC" } }],
      },
    });

    if (response.errors || !response.data) {
      throw new Error("Could not load contact imports.");
    }

    const connection: ContactImportHistory$result["contactImports"] = response.data.contactImports;
    const pageJobs: ContactImportHistoryJob[] = connection.edges.map((edge) => edge.node);
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
