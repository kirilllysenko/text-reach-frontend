import { useParams } from "@solidjs/router";
import Papa from "papaparse";
import { createEffect, createSignal, For, onSettled, Show } from "solid-js";
import {
  ExportMessagesDocument,
  MessagesDocument,
  type ExportMessagesQuery,
  type MessageFilterInput,
  type MessageSortByInput,
  type MessagesQuery,
  type MessageStatus,
} from "~/gql/graphql";
import { PATH_CAMPAIGN } from "~/lib/app/paths";
import { Button, Card, Input, PageTitle, VirtualTable, type VirtualColumn } from "~/components";
import { formatPhoneNumber } from "~/lib/feature/phone/phone-display";
import { graphqlClient } from "~/lib/graphql/client";
import { showError, showInfo } from "~/lib/state/notifications";
import { selectedPhoneId } from "~/lib/state/phone-filter";

type MessageRow = MessagesQuery["messages"]["edges"][number]["node"];
type ExportMessage = ExportMessagesQuery["messages"]["edges"][number]["node"];
type MessageSort = "sent-desc" | "sent-asc" | "status" | "phone" | "text";

const statusLabels: Record<MessageStatus, string> = {
  BLOCKED: "Blocked",
  FAILED: "Failed",
  IN_VERIFICATION: "In verification",
  PENDING: "Pending",
  QUEUED: "Queued",
  RECEIVED: "Received",
  SENT: "Sent",
};
const statusOptions = Object.keys(statusLabels) as MessageStatus[];
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export default function CampaignMessagesPage() {
  const params = useParams<{ id: string }>();
  const [messages, setMessages] = createSignal<MessageRow[]>([]);
  const [search, setSearch] = createSignal("");
  const [statuses, setStatuses] = createSignal<MessageStatus[]>([]);
  const [sentFrom, setSentFrom] = createSignal("");
  const [sentTo, setSentTo] = createSignal("");
  const [sort, setSort] = createSignal<MessageSort>("sent-desc");
  const [loading, setLoading] = createSignal(true);
  const [loadingMore, setLoadingMore] = createSignal(false);
  const [exporting, setExporting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [nextCursor, setNextCursor] = createSignal<string | null>(null);
  const [hasMore, setHasMore] = createSignal(false);
  const [totalCount, setTotalCount] = createSignal(0);
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  let requestVersion = 0;

  const columns: VirtualColumn<MessageRow>[] = [
    {
      id: "sentAt",
      header: "Sent at",
      width: "12rem",
      cell: (message) => formatMessageDate(message.sentAt, "Not sent"),
    },
    { id: "status", header: "Status", width: "9rem", cell: (message) => statusLabels[message.status] },
    {
      id: "phone",
      header: "Tenant phone",
      width: "12rem",
      cell: (message) => formatPhoneNumber(message.tenantPhoneNumber),
    },
    { id: "text", header: "Text", width: "minmax(20rem, 1fr)", cell: (message) => message.text || "—" },
    { id: "contact", header: "Contact ID", width: "14rem", cell: (message) => message.contact?.id ?? "—" },
    { id: "conversation", header: "Conversation ID", width: "14rem", cell: (message) => message.conversation.id },
    {
      id: "actions",
      header: "",
      width: "6rem",
      align: "right",
      cell: (message) => <MessageInspection message={message} />,
    },
  ];

  onSettled(() => {
    void reload();
    return () => {
      requestVersion += 1;
      if (searchTimer) clearTimeout(searchTimer);
    };
  });

  createEffect(selectedPhoneId, () => {
    if (requestVersion > 0) void reload();
  });

  function updateSearch(value: string): void {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => void reload(), 250);
  }

  function toggleStatus(status: MessageStatus): void {
    setStatuses((current) =>
      current.includes(status) ? current.filter((value) => value !== status) : [...current, status],
    );
    void reload();
  }

  async function reload(): Promise<void> {
    const version = ++requestVersion;
    setLoading(true);
    setError(null);
    setMessages([]);
    setNextCursor(null);
    await loadPage(true, version);
  }

  async function loadPage(reset = false, version = requestVersion): Promise<void> {
    if (!reset && (loadingMore() || !hasMore())) return;
    if (!reset) setLoadingMore(true);
    try {
      const response = await graphqlClient.query(
        MessagesDocument,
        {
          after: reset ? null : nextCursor(),
          filter: buildMessageFilter(params.id, search(), statuses(), sentFrom(), sentTo(), selectedPhoneId()),
          first: 200,
          sortBy: messageSort(sort()),
        },
        { requestPolicy: "network-only" },
      );
      if (version !== requestVersion) return;
      if (response.error || !response.data) throw new Error();
      const result = response.data.messages;
      const incoming = result.edges.map((edge) => edge.node);
      setMessages((current) => (reset ? incoming : mergeRows(current, incoming)));
      setNextCursor(result.pageInfo.endCursor ?? null);
      setHasMore(result.pageInfo.hasNextPage && Boolean(result.pageInfo.endCursor));
      setTotalCount(result.totalCount);
      setError(null);
    } catch {
      if (version === requestVersion) setError("Could not load campaign messages.");
    } finally {
      if (version === requestVersion) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  async function exportMessages(): Promise<void> {
    if (exporting()) return;
    setExporting(true);
    try {
      const exported: ExportMessage[] = [];
      const seen = new Set<string>();
      let after: string | undefined;
      while (true) {
        const response = await graphqlClient.query(
          ExportMessagesDocument,
          {
            after,
            filter: buildMessageFilter(params.id, search(), statuses(), sentFrom(), sentTo(), selectedPhoneId()),
            first: 500,
            sortBy: messageSort(sort()),
          },
          { requestPolicy: "network-only" },
        );
        if (response.error || !response.data) throw new Error();
        exported.push(...response.data.messages.edges.map((edge) => edge.node));
        if (!response.data.messages.pageInfo.hasNextPage) break;
        const cursor = response.data.messages.pageInfo.endCursor;
        if (!cursor || seen.has(cursor)) throw new Error();
        seen.add(cursor);
        after = cursor;
      }
      if (exported.length === 0) {
        showInfo("There are no messages to export.");
        return;
      }
      downloadCsv(Papa.unparse(exportRows(exported)), `campaign-messages-${new Date().toISOString().slice(0, 10)}.csv`);
      showInfo("Messages exported.");
    } catch {
      showError("There was an error.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Campaign messages">
        <div class="flex items-center gap-2">
          <a href={PATH_CAMPAIGN} class="text-sm font-medium text-sky-700">
            Back
          </a>
          <Button spinner={exporting()} onClick={() => void exportMessages()}>
            Export
          </Button>
        </div>
      </PageTitle>
      <Card variant="panel" class="shrink-0 space-y-3">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            class="min-w-0 grow"
            type="search"
            placeholder="Search message text or phone"
            value={search()}
            onInput={(event) => updateSearch(event.currentTarget.value)}
          />
          <select
            class="glass-input h-10 px-3 text-sm text-slate-700"
            value={sort()}
            aria-label="Sort messages"
            onChange={(event) => {
              setSort(event.currentTarget.value as MessageSort);
              void reload();
            }}
          >
            <option value="sent-desc">Newest sent</option>
            <option value="sent-asc">Oldest sent</option>
            <option value="status">Status</option>
            <option value="phone">Tenant phone</option>
            <option value="text">Text</option>
          </select>
          <details class="relative">
            <summary class="glass-input flex h-10 min-w-28 cursor-pointer items-center px-3 text-sm text-slate-700">
              Status{statuses().length ? ` (${statuses().length})` : ""}
            </summary>
            <div class="absolute top-11 right-0 z-20 w-60 space-y-1 rounded-xl border border-white bg-white p-3 shadow-xl">
              <For each={statusOptions}>
                {(status) => (
                  <label class="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={statuses().includes(status)}
                      onChange={() => toggleStatus(status)}
                    />
                    {statusLabels[status]}
                  </label>
                )}
              </For>
            </div>
          </details>
        </div>
        <div class="flex flex-wrap items-end gap-2">
          <label class="text-xs text-slate-600">
            Sent from
            <Input
              type="date"
              value={sentFrom()}
              onChange={(event) => {
                setSentFrom(event.currentTarget.value);
                void reload();
              }}
            />
          </label>
          <label class="text-xs text-slate-600">
            Sent to
            <Input
              type="date"
              value={sentTo()}
              onChange={(event) => {
                setSentTo(event.currentTarget.value);
                void reload();
              }}
            />
          </label>
          <span class="ml-auto text-xs text-slate-500">{totalCount().toLocaleString()} messages</span>
        </div>
      </Card>
      <Card variant="table">
        <VirtualTable
          columns={columns}
          rows={messages()}
          getRowId={(message) => message.id}
          loading={loading()}
          error={error()}
        />
        <Show when={hasMore() && !loading()}>
          <div class="border-t border-white/80 p-2 text-center">
            <Button small variant="secondary" spinner={loadingMore()} onClick={() => void loadPage()}>
              Load more
            </Button>
          </div>
        </Show>
      </Card>
    </div>
  );
}

function MessageInspection(props: { message: MessageRow }) {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <Button small variant="secondary" onClick={() => setOpen(true)}>
        Inspect
      </Button>
      <Show when={open()}>
        <div class="fixed inset-0 z-60 flex items-center justify-center">
          <button
            class="absolute inset-0 bg-slate-900/35"
            aria-label="Close message details"
            onClick={() => setOpen(false)}
          />
          <div
            class="relative z-10 mx-3 max-h-[85dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white bg-white p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold">Message details</h2>
                <p class="text-sm text-slate-500">Delivery, media, and identifiers.</p>
              </div>
              <Button small variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            <p class="mt-4 rounded-xl bg-slate-100 p-3 text-sm whitespace-pre-wrap">
              {props.message.text || "No text content."}
            </p>
            <Show when={props.message.media.length > 0}>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <For each={props.message.media}>
                  {(media, index) => (
                    <a
                      class="overflow-hidden rounded-xl border border-slate-200 text-sm text-sky-700"
                      href={media.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Show when={media.contentType.startsWith("image/")}>
                        <img class="h-40 w-full object-cover" src={media.url} alt={`Attachment ${index() + 1}`} />
                      </Show>
                      <span class="block p-2">
                        Attachment {index() + 1} · {media.contentType}
                      </span>
                    </a>
                  )}
                </For>
              </div>
            </Show>
            <dl class="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <Detail label="Status" value={statusLabels[props.message.status]} />
              <Detail label="Direction" value={props.message.direction === "INBOUND" ? "Inbound" : "Outbound"} />
              <Detail label="Created" value={formatMessageDate(props.message.createdAt)} />
              <Detail label="Sent" value={formatMessageDate(props.message.sentAt)} />
              <Detail label="Received" value={formatMessageDate(props.message.receivedAt)} />
              <Detail label="Tenant phone" value={props.message.tenantPhoneNumber} />
              <Detail label="Message ID" value={props.message.id} />
              <Detail label="Contact ID" value={props.message.contact?.id ?? "Not associated"} />
              <Detail label="Conversation ID" value={props.message.conversation.id} />
              <Detail label="Tenant phone ID" value={props.message.tenantPhone.id} />
            </dl>
          </div>
        </div>
      </Show>
    </>
  );
}

function Detail(props: { label: string; value: string }) {
  return (
    <div class="min-w-0">
      <dt class="text-xs font-medium text-slate-500 uppercase">{props.label}</dt>
      <dd class="mt-1 text-sm break-words text-slate-800">{props.value}</dd>
    </div>
  );
}

function buildMessageFilter(
  campaignId: string,
  search: string,
  statuses: MessageStatus[],
  sentFrom: string,
  sentTo: string,
  phoneId: string | null,
): MessageFilterInput {
  const nested: MessageFilterInput[] = [{ campaignId: { in: [campaignId] } }];
  if (phoneId) nested.push({ tenantPhoneId: { in: [phoneId] } });
  if (statuses.length > 0) nested.push({ status: { in: [...statuses] } });
  if (sentFrom) nested.push({ sentAt: { greaterOrEqual: `${sentFrom}T00:00:00.000Z` } });
  if (sentTo) nested.push({ sentAt: { lessOrEqual: `${sentTo}T23:59:59.999Z` } });
  const normalized = search.trim();
  if (normalized)
    nested.push({
      operator: "OR",
      nested: [{ text: { contains: normalized } }, { tenantPhoneNumber: { contains: normalized } }],
    });
  return { operator: "AND", nested };
}

function messageSort(sort: MessageSort): MessageSortByInput[] {
  if (sort === "sent-asc") return [{ sentAt: { direction: "ASC" } }];
  if (sort === "status") return [{ status: { direction: "ASC" } }];
  if (sort === "phone") return [{ tenantPhoneNumber: { direction: "ASC" } }];
  if (sort === "text") return [{ text: { direction: "ASC" } }];
  return [{ sentAt: { direction: "DESC" } }];
}

function formatMessageDate(value?: string | null, fallback = "Not recorded"): string {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function mergeRows(current: MessageRow[], incoming: MessageRow[]): MessageRow[] {
  const ids = new Set(current.map((message) => message.id));
  return [...current, ...incoming.filter((message) => !ids.has(message.id))];
}

function exportRows(messages: ExportMessage[]): { fields: string[]; data: Array<Array<string | number>> } {
  return {
    fields: [
      "Message ID",
      "Campaign ID",
      "Contact ID",
      "Conversation ID",
      "Tenant Phone ID",
      "Tenant Phone Number",
      "Direction",
      "Status",
      "Created At",
      "Sent At",
      "Received At",
      "Text",
      "Media URLs",
      "Media Content Types",
      "Media Sizes (Bytes)",
    ],
    data: messages.map((message) => [
      message.id,
      message.campaign?.id ?? "",
      message.contact?.id ?? "",
      message.conversation.id,
      message.tenantPhone.id,
      message.tenantPhoneNumber,
      message.direction,
      message.status,
      message.createdAt,
      message.sentAt ?? "",
      message.receivedAt ?? "",
      message.text,
      message.media.map((media) => media.url).join(" "),
      message.media.map((media) => media.contentType).join(" "),
      message.media.map((media) => media.sizeBytes ?? "").join(" "),
    ]),
  };
}

function downloadCsv(csv: string, filename: string): void {
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
