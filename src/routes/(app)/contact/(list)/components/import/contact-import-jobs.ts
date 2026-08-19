import type { ContactImportJobsStore } from "$houdini";
import type { ContactImportJobs$result } from "$houdini/artifacts/ContactImportJobs";
import { contactJobCutoff } from "$lib/feature/contact-job/contact-job";

const JOB_PAGE_SIZE = 100;

export type ContactImportJob = ContactImportJobs$result["contactImports"]["edges"][number]["node"];
type ContactImportJobsResponse = Awaited<ReturnType<ContactImportJobsStore["fetch"]>>;

export async function loadContactImportJobs(query: ContactImportJobsStore): Promise<ContactImportJob[]> {
  const jobs: ContactImportJob[] = [];
  const cutoff = contactJobCutoff();
  let after: string | null = null;

  while (true) {
    const response: ContactImportJobsResponse = await query.fetch({
      variables: {
        after,
        first: JOB_PAGE_SIZE,
        sortBy: [{ createdAt: { direction: "DESC" } }],
      },
    });

    if (response.errors || !response.data) {
      throw new Error("Could not load contact imports.");
    }

    const connection: ContactImportJobs$result["contactImports"] = response.data.contactImports;
    const pageJobs: ContactImportJob[] = connection.edges.map((edge) => edge.node);
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
