import { createMemo, createSignal, onSettled } from "solid-js";
import { CustomFieldsDocument, type CustomFieldType, type CustomFieldsQuery } from "~/gql/graphql";
import { PATH_CUSTOM_FIELD_ADD, buildCustomFieldEditPath } from "~/lib/app/paths";
import { Card, Input, LinkButton, PageTitle, VirtualTable, type VirtualColumn } from "~/components";
import { customFieldTypeLabelMap, customFieldTypeOptions } from "~/lib/feature/custom-field/custom-field-view-data";
import { graphqlClient } from "~/lib/graphql/client";
import { hasAccess } from "~/lib/state/session";

type CustomFieldRow = CustomFieldsQuery["customFields"][number];

export default function CustomFieldsPage() {
  const [rows, setRows] = createSignal<CustomFieldRow[]>([]);
  const [search, setSearch] = createSignal("");
  const [type, setType] = createSignal<CustomFieldType | "">("");
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const visibleRows = createMemo(() => {
    const query = search().trim().toLocaleLowerCase();
    return rows()
      .filter(
        (row) => (!type() || row.fieldType === type()) && (!query || row.name.toLocaleLowerCase().includes(query)),
      )
      .toSorted((left, right) => left.name.localeCompare(right.name));
  });
  const columns: VirtualColumn<CustomFieldRow>[] = [
    { id: "name", header: "Name", width: "minmax(15rem, 1fr)", cell: (row) => row.name },
    { id: "type", header: "Type", width: "10rem", cell: (row) => customFieldTypeLabelMap[row.fieldType] },
    {
      id: "action",
      header: "",
      width: "5rem",
      align: "right",
      cell: (row) =>
        hasAccess("CUSTOM_FIELDS_WRITE") ? (
          <a
            href={buildCustomFieldEditPath(row.id)}
            class="inline-flex h-7 items-center rounded-lg border border-white/80 bg-white/80 px-2 text-sm text-sky-700"
          >
            Edit
          </a>
        ) : null,
    },
  ];
  onSettled(() => {
    void (async () => {
      try {
        const response = await graphqlClient.query(CustomFieldsDocument, {}, { requestPolicy: "network-only" });
        if (response.error || !response.data) throw new Error();
        setRows(response.data.customFields);
      } catch {
        setError("Could not load custom fields.");
      } finally {
        setLoading(false);
      }
    })();
  });
  return (
    <div class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Custom Fields">
        {hasAccess("CUSTOM_FIELDS_WRITE") && <LinkButton href={PATH_CUSTOM_FIELD_ADD}>Add custom field</LinkButton>}
      </PageTitle>
      <Card variant="panel" class="shrink-0">
        <div class="flex gap-2">
          <Input
            class="min-w-0 grow"
            placeholder="Search custom fields"
            value={search()}
            onInput={(event) => setSearch(event.currentTarget.value)}
          />
          <select
            class="glass-input h-10 px-3 text-sm"
            value={type()}
            onChange={(event) => setType(event.currentTarget.value as CustomFieldType | "")}
          >
            <option value="">All types</option>
            {customFieldTypeOptions.map((value) => (
              <option value={value}>{customFieldTypeLabelMap[value]}</option>
            ))}
          </select>
        </div>
      </Card>
      <Card variant="table">
        <VirtualTable
          columns={columns}
          rows={visibleRows()}
          getRowId={(row) => row.id}
          loading={loading()}
          error={error()}
        />
      </Card>
    </div>
  );
}
