import type { ContactExportJobsStore } from "$houdini";
import type { ContactExportJobs$result } from "$houdini/artifacts/ContactExportJobs";
import { contactJobCutoff } from "$lib/feature/contact-job/contact-job";

const JOB_PAGE_SIZE = 100;

export type ContactExportJob = ContactExportJobs$result["contactExports"]["edges"][number]["node"];
type ContactExportJobsResponse = Awaited<ReturnType<ContactExportJobsStore["fetch"]>>;

export async function loadContactExportJobs(query: ContactExportJobsStore): Promise<ContactExportJob[]> {
  const jobs: ContactExportJob[] = [];
  const cutoff = contactJobCutoff();
  let after: string | null = null;

  while (true) {
    const response: ContactExportJobsResponse = await query.fetch({
      variables: {
        after,
        first: JOB_PAGE_SIZE,
        sortBy: [{ createdAt: { direction: "DESC" } }],
      },
    });

    if (response.errors || !response.data) {
      throw new Error("Could not load contact exports.");
    }

    const connection: ContactExportJobs$result["contactExports"] = response.data.contactExports;
    const pageJobs: ContactExportJob[] = connection.edges.map((edge) => edge.node);
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
