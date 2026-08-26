import { createMemo, createSignal, onSettled, Show } from "solid-js";
import {
  WalletTransactionsDocument,
  type WalletTransactionFilterInput,
  type WalletTransactionsQuery,
} from "~/gql/graphql";
import { Button, Card, Input, PageTitle, VirtualTable, type VirtualColumn } from "~/components";
import { formatPaymentDate, formatPaymentType, formatUsdMicros } from "~/lib/feature/payment/payment-display";
import { graphqlClient } from "~/lib/graphql/client";

type TransactionRow = WalletTransactionsQuery["walletTransactions"]["edges"][number]["node"];
const ulidPattern = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

export default function PaymentTransactionPage() {
  const [rows, setRows] = createSignal<TransactionRow[]>([]);
  const [idSearch, setIdSearch] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const activeIdSearchIsInvalid = createMemo(() => Boolean(idSearch().trim()) && !ulidPattern.test(idSearch().trim()));

  const columns: VirtualColumn<TransactionRow>[] = [
    { id: "createdAt", header: "Created", width: "12rem", cell: (row) => formatPaymentDate(row.createdAt) },
    { id: "amount", header: "Amount", width: "9rem", cell: (row) => formatUsdMicros(row.amountUsdMicros) },
    { id: "currency", header: "Currency", width: "7rem", cell: (row) => row.currency },
    { id: "entryType", header: "Entry Type", width: "10rem", cell: (row) => formatPaymentType(row.entryType) },
    {
      id: "sourceType",
      header: "Source Type",
      width: "10rem",
      cell: (row) => (row.source ? formatPaymentType(row.source.__typename) : "—"),
    },
    { id: "sourceId", header: "Source ID", width: "minmax(14rem, 1fr)", cell: (row) => row.source?.id ?? "—" },
    { id: "id", header: "Transaction ID", width: "minmax(14rem, 1fr)", cell: (row) => row.id },
  ];

  onSettled(() => void loadTransactions());

  async function loadTransactions(): Promise<void> {
    setLoading(true);
    setError(null);
    const normalizedId = idSearch().trim().toUpperCase();
    const filter: WalletTransactionFilterInput | undefined = ulidPattern.test(normalizedId)
      ? { operator: "OR", nested: [{ id: { in: [normalizedId] } }, { sourceId: { in: [normalizedId] } }] }
      : undefined;
    try {
      const response = await graphqlClient.query(
        WalletTransactionsDocument,
        { first: 500, filter, sortBy: [{ createdAt: { direction: "DESC" } }] },
        { requestPolicy: "network-only" },
      );
      if (response.error || !response.data) throw new Error();
      setRows(response.data.walletTransactions.edges.map((edge) => edge.node));
    } catch {
      setError("Could not load wallet transactions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Transactions">
        <Button variant="secondary" onClick={() => window.history.back()}>
          Balance
        </Button>
      </PageTitle>
      <Card variant="panel" class="shrink-0 space-y-3">
        <form
          class="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void loadTransactions();
          }}
        >
          <Input
            class="min-w-0 grow"
            placeholder="Search transaction or source ID"
            value={idSearch()}
            onInput={(event) => setIdSearch(event.currentTarget.value)}
          />
          <Button submit spinner={loading()}>
            Search
          </Button>
        </form>
        <Show when={activeIdSearchIsInvalid()}>
          <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
            Enter a full transaction or source ID to search by ID.
          </div>
        </Show>
      </Card>
      <Card variant="table">
        <VirtualTable columns={columns} rows={rows()} getRowId={(row) => row.id} loading={loading()} error={error()} />
      </Card>
    </div>
  );
}
