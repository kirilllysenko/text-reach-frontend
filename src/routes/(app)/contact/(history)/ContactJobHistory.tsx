import { createSignal, onSettled } from "solid-js";
import {
  ContactExportHistoryDocument,
  ContactExportHistoryDownloadUrlDocument,
  ContactImportHistoryDocument,
  type ContactExportHistoryQuery,
  type ContactImportHistoryQuery,
} from "~/gql/graphql";
import { PATH_CONTACT } from "~/lib/app/paths";
import { Button, Card, PageTitle, VirtualTable, type VirtualColumn } from "~/components";
import { graphqlClient } from "~/lib/graphql/client";
import { showError } from "~/lib/state/notifications";

type ImportJob = ContactImportHistoryQuery["contactImports"]["edges"][number]["node"];
type ExportJob = ContactExportHistoryQuery["contactExports"]["edges"][number]["node"];

export function ContactJobHistory(props: { kind: "import" | "export" }) {
  const [jobs, setJobs] = createSignal<Array<ImportJob | ExportJob>>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [downloading, setDownloading] = createSignal<string | null>(null);
  let timer: ReturnType<typeof setInterval> | undefined;
  const columns: VirtualColumn<ImportJob | ExportJob>[] = [
    { id: "file", header: "Filename", width: "minmax(16rem, 1fr)", cell: (job) => job.filename },
    { id: "status", header: "Status", width: "9rem", cell: (job) => formatStatus(job.status) },
    { id: "created", header: "Created", width: "12rem", cell: (job) => formatDate(job.createdAt) },
    { id: "processed", header: "Processed", width: "8rem", cell: (job) => job.processedRows.toLocaleString() },
    {
      id: "result",
      header: props.kind === "import" ? "Imported" : "Total",
      width: "8rem",
      cell: (job) => ("importedRows" in job ? job.importedRows : job.totalRows).toLocaleString(),
    },
    {
      id: "action",
      header: "",
      width: "7rem",
      align: "right",
      cell: (job) =>
        props.kind === "export" && job.status === "COMPLETED" ? (
          <Button
            small
            variant="secondary"
            spinner={downloading() === job.id}
            onClick={() => void download(job as ExportJob)}
          >
            Download
          </Button>
        ) : null,
    },
  ];

  onSettled(() => {
    void load();
    timer = setInterval(() => void load(false), 5000);
    return () => {
      if (timer) clearInterval(timer);
    };
  });

  async function load(showLoading = true): Promise<void> {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      if (props.kind === "import") {
        const response = await graphqlClient.query(
          ContactImportHistoryDocument,
          { first: 100, sortBy: [{ createdAt: { direction: "DESC" } }] },
          { requestPolicy: "network-only" },
        );
        if (response.error || !response.data) throw new Error();
        setJobs(
          response.data.contactImports.edges
            .map((edge) => edge.node)
            .filter((job) => Date.parse(job.createdAt) >= cutoff),
        );
      } else {
        const response = await graphqlClient.query(
          ContactExportHistoryDocument,
          { first: 100, sortBy: [{ createdAt: { direction: "DESC" } }] },
          { requestPolicy: "network-only" },
        );
        if (response.error || !response.data) throw new Error();
        setJobs(
          response.data.contactExports.edges
            .map((edge) => edge.node)
            .filter((job) => Date.parse(job.createdAt) >= cutoff),
        );
      }
    } catch {
      setError(`Could not load contact ${props.kind}s.`);
    } finally {
      setLoading(false);
    }
  }

  async function download(job: ExportJob): Promise<void> {
    setDownloading(job.id);
    try {
      const response = await graphqlClient.query(
        ContactExportHistoryDownloadUrlDocument,
        { id: job.id },
        { requestPolicy: "network-only" },
      );
      const url = response.data?.contactExportDownloadUrl.url;
      if (response.error || !url) throw new Error();
      const link = document.createElement("a");
      link.href = url;
      link.download = job.filename;
      link.rel = "noopener";
      link.click();
    } catch {
      showError("Could not download the export file.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title={`${props.kind === "import" ? "Import" : "Export"} history`}>
        <a href={PATH_CONTACT} class="text-sm font-medium text-sky-700">
          Contacts
        </a>
      </PageTitle>
      <p class="text-sm text-slate-500">Last 30 days</p>
      <Card variant="table">
        <VirtualTable columns={columns} rows={jobs()} getRowId={(job) => job.id} loading={loading()} error={error()} />
      </Card>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
function formatStatus(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
