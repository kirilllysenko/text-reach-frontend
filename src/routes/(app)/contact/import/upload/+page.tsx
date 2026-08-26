import { useNavigate } from "@solidjs/router";
import Papa from "papaparse";
import { createMemo, createSignal, For, onSettled, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import * as XLSX from "xlsx";
import {
  ContactGroupComboboxQueryDocument,
  ContactImportCustomFieldsQueryDocument,
  GenerateContactUploadUrlDocument,
  ImportContactsDocument,
  type ContactImportColumnInput,
  type RegularContactImportField,
} from "~/gql/graphql";
import { PATH_CONTACT, PATH_CONTACT_IMPORT_HISTORY } from "~/lib/app/paths";
import { Button, Card, FieldError, PageTitle } from "~/components";
import { graphqlClient } from "~/lib/graphql/client";
import { showInfo } from "~/lib/state/notifications";

type Step = "setup" | "mapping" | "complete";
type MappingValue = "IGNORE" | `REGULAR:${RegularContactImportField}` | `CUSTOM:${string}`;
interface Column {
  index: number;
  label: string;
}
interface Group {
  id: string;
  name: string;
}

const regularFields: Array<[RegularContactImportField, string]> = [
  ["PHONE_NUMBER", "Phone number"],
  ["FIRST_NAME", "First name"],
  ["LAST_NAME", "Last name"],
  ["EMAIL", "Email"],
  ["BIRTHDAY", "Birthday"],
  ["NOTES", "Notes"],
];

export default function ContactImportPage() {
  const navigate = useNavigate();
  const [state, setState] = createStore({
    step: "setup" as Step,
    file: null as File | null,
    groupIds: [] as string[],
    consent: false,
    rows: [] as string[][],
    columns: [] as Column[],
    skipFirstRow: false,
    mappings: {} as Record<number, MappingValue>,
    uploadedFilename: "",
  });
  const [groups, setGroups] = createSignal<Group[]>([]);
  const [customFields, setCustomFields] = createSignal<Array<{ id: string; name: string }>>([]);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let fileInput: HTMLInputElement | undefined;
  const options = createMemo(() => [
    { value: "IGNORE" as MappingValue, label: "Ignore column" },
    ...regularFields.map(([value, label]) => ({ value: `REGULAR:${value}` as MappingValue, label })),
    ...customFields().map((field) => ({ value: `CUSTOM:${field.id}` as MappingValue, label: field.name })),
  ]);

  onSettled(() => void loadOptions());

  async function loadOptions(): Promise<void> {
    try {
      const [groupResult, fieldResult] = await Promise.all([
        graphqlClient.query(
          ContactGroupComboboxQueryDocument,
          { first: 300, sortBy: [{ name: { direction: "ASC" } }] },
          { requestPolicy: "network-only" },
        ),
        graphqlClient.query(ContactImportCustomFieldsQueryDocument, {}, { requestPolicy: "network-only" }),
      ]);
      if (groupResult.error || fieldResult.error || !groupResult.data || !fieldResult.data) throw new Error();
      setGroups(groupResult.data.contactGroups.edges.map((edge) => edge.node));
      setCustomFields(fieldResult.data.customFields.map(({ id, name }) => ({ id, name })));
    } catch {
      setError("Could not load import options.");
    }
  }

  function chooseFile(file: File | null): void {
    setState({ file, consent: false, rows: [], columns: [], mappings: {}, uploadedFilename: "", step: "setup" });
    setError(null);
  }

  async function continueToMapping(): Promise<void> {
    if (!state.file || !state.consent || submitting()) return;
    setSubmitting(true);
    setError(null);
    try {
      const parsed = await parseFile(state.file);
      const response = await graphqlClient.mutation(GenerateContactUploadUrlDocument, { filename: state.file.name });
      const upload = response.data?.generateContactUploadUrl;
      if (response.error || !upload) throw new Error("Could not prepare contacts upload.");
      const uploadResult = await fetch(upload.url, {
        method: "PUT",
        headers: { "Content-Type": state.file.type || fallbackType(state.file) },
        body: state.file,
      });
      if (!uploadResult.ok) throw new Error("Could not upload contacts file.");
      setState({
        rows: parsed.rows,
        columns: parsed.columns,
        skipFirstRow: parsed.skipFirstRow,
        uploadedFilename: upload.newFilename,
        mappings: Object.fromEntries(
          parsed.columns.map((column) => [column.index, inferMapping(column.label, customFields())]),
        ),
        step: "mapping",
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not prepare contacts import.");
    } finally {
      setSubmitting(false);
    }
  }

  async function queueImport(): Promise<void> {
    if (submitting()) return;
    setSubmitting(true);
    setError(null);
    try {
      const fields = buildFields(state.columns, state.mappings);
      const validationError = validateFields(fields);
      if (validationError) {
        setError(validationError);
        return;
      }
      const response = await graphqlClient.mutation(ImportContactsDocument, {
        input: {
          filename: state.uploadedFilename,
          fields,
          contactGroupIds: [...state.groupIds],
          skipFirstRow: state.skipFirstRow,
        },
      });
      if (response.error || !response.data?.importContacts) throw new Error("Could not queue contact import.");
      setState("step", "complete");
      showInfo("Contact import has been queued.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not import contacts.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Import contacts">
        <a href={PATH_CONTACT} class="text-sm font-medium text-sky-700">
          Contacts
        </a>
      </PageTitle>
      <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18">
        <Card variant="panel" class="w-full max-w-6xl p-4 sm:p-6">
          <Show when={state.step === "setup"}>
            <section class="space-y-4">
              <div>
                <p class="mb-2 text-sm font-medium text-slate-700">Contacts file</p>
                <div class="flex items-center gap-3">
                  <input
                    ref={fileInput}
                    class="hidden"
                    type="file"
                    accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(event) => {
                      chooseFile(event.currentTarget.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />
                  <Button variant="secondary" onClick={() => fileInput?.click()}>
                    Choose file
                  </Button>
                  <span class="truncate text-sm text-slate-600">{state.file?.name ?? "No file selected"}</span>
                </div>
              </div>
              <fieldset>
                <legend class="mb-2 text-sm font-medium text-slate-700">Contact groups</legend>
                <div class="grid gap-2 sm:grid-cols-2">
                  <For each={groups()}>
                    {(group) => (
                      <label class="flex items-center gap-2 rounded-xl bg-white/75 p-3 text-sm">
                        <input
                          type="checkbox"
                          checked={state.groupIds.includes(group.id)}
                          onChange={(event) =>
                            setState(
                              "groupIds",
                              event.currentTarget.checked
                                ? [...state.groupIds, group.id]
                                : state.groupIds.filter((id) => id !== group.id),
                            )
                          }
                        />
                        {group.name}
                      </label>
                    )}
                  </For>
                </div>
              </fieldset>
              <label class="bg-amber-50 text-amber-950 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={state.consent}
                  onChange={(event) => setState("consent", event.currentTarget.checked)}
                />
                <span>
                  <strong>I confirm every contact has consented to receive text messages.</strong>
                  <span class="mt-1 block text-amber-800">Keep proof of consent and honor opt-out requests.</span>
                </span>
              </label>
              <FieldError error={error()} />
              <div class="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => navigate(PATH_CONTACT)}>
                  Cancel
                </Button>
                <Button
                  disabled={!state.file || !state.consent}
                  spinner={submitting()}
                  onClick={() => void continueToMapping()}
                >
                  Continue
                </Button>
              </div>
            </section>
          </Show>
          <Show when={state.step === "mapping"}>
            <section class="space-y-4">
              <label class="flex items-center gap-2 rounded-xl bg-white/70 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={state.skipFirstRow}
                  onChange={(event) => setState("skipFirstRow", event.currentTarget.checked)}
                />
                First row contains headers
              </label>
              <div class="grid gap-3 md:grid-cols-2">
                <For each={state.columns}>
                  {(column) => (
                    <label class="rounded-xl border border-white bg-white/70 p-3 text-sm">
                      <span class="mb-2 block font-medium text-slate-700">{column.label}</span>
                      <select
                        class="glass-input h-10 w-full px-3"
                        value={state.mappings[column.index]}
                        onChange={(event) =>
                          setState("mappings", column.index, event.currentTarget.value as MappingValue)
                        }
                      >
                        <For each={options()}>{(option) => <option value={option.value}>{option.label}</option>}</For>
                      </select>
                    </label>
                  )}
                </For>
              </div>
              <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <For each={state.columns}>
                        {(column) => <th class="bg-slate-100 px-3 py-2">{column.label}</th>}
                      </For>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={state.rows.slice(state.skipFirstRow ? 1 : 0, state.skipFirstRow ? 11 : 10)}>
                      {(row) => (
                        <tr>
                          <For each={state.columns}>
                            {(column) => (
                              <td class="max-w-48 truncate border-t border-slate-100 px-3 py-2">{row[column.index]}</td>
                            )}
                          </For>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
              <FieldError error={error()} />
              <div class="flex justify-between">
                <Button variant="secondary" onClick={() => setState("step", "setup")}>
                  Back
                </Button>
                <Button spinner={submitting()} onClick={() => void queueImport()}>
                  Import
                </Button>
              </div>
            </section>
          </Show>
          <Show when={state.step === "complete"}>
            <section class="space-y-4">
              <div class="bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 p-4 text-sm">
                Contact import has been queued.
              </div>
              <div class="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => navigate(PATH_CONTACT)}>
                  Back to contacts
                </Button>
                <Button onClick={() => navigate(PATH_CONTACT_IMPORT_HISTORY)}>View import history</Button>
              </div>
            </section>
          </Show>
        </Card>
      </div>
    </div>
  );
}

async function parseFile(file: File): Promise<{ columns: Column[]; rows: string[][]; skipFirstRow: boolean }> {
  if (!/\.(csv|xlsx)$/i.test(file.name)) throw new Error("Choose a CSV or XLSX file.");
  const raw = file.name.toLowerCase().endsWith(".csv")
    ? parseCsv(await file.text())
    : parseXlsx(await file.arrayBuffer());
  const rows = raw
    .map((row) => row.map((value) => (value == null ? "" : String(value).trim())))
    .filter((row) => row.some(Boolean));
  if (!rows.length) throw new Error("The selected file does not contain contact rows.");
  const count = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) => Array.from({ length: count }, (_, index) => row[index] ?? ""));
  const first = normalized[0] ?? [];
  return {
    rows: normalized,
    columns: Array.from({ length: count }, (_, index) => ({
      index,
      label: first[index]?.trim() || `Column ${index + 1}`,
    })),
    skipFirstRow: first.some((cell) => Boolean(headerMap[normalize(cell)])),
  };
}
function parseCsv(text: string): unknown[][] {
  const result = Papa.parse<unknown[]>(text, { skipEmptyLines: "greedy" });
  if (result.errors.length) throw new Error("Could not parse CSV file.");
  return result.data;
}
function parseXlsx(buffer: ArrayBuffer): unknown[][] {
  const book = XLSX.read(buffer, { type: "array" });
  const sheet = book.Sheets[book.SheetNames[0] ?? ""];
  if (!sheet) throw new Error("The workbook does not contain a readable sheet.");
  return XLSX.utils.sheet_to_json(sheet, { blankrows: false, defval: "", header: 1 }) as unknown[][];
}
function inferMapping(label: string, custom: Array<{ id: string; name: string }>): MappingValue {
  const regular = headerMap[normalize(label)];
  if (regular) return `REGULAR:${regular}`;
  const field = custom.find((item) => normalize(item.name) === normalize(label));
  return field ? `CUSTOM:${field.id}` : "IGNORE";
}
function buildFields(columns: Column[], mappings: Record<number, MappingValue>): ContactImportColumnInput[] {
  return columns.flatMap((column) => {
    const value = mappings[column.index] ?? "IGNORE";
    if (value === "IGNORE") return [];
    return [
      {
        columnIndex: column.index,
        ...(value.startsWith("REGULAR:")
          ? { regularField: value.slice(8) as RegularContactImportField }
          : { customFieldId: value.slice(7) }),
      },
    ];
  });
}
function validateFields(fields: ContactImportColumnInput[]): string | null {
  if (fields.filter((field) => field.regularField === "PHONE_NUMBER").length !== 1)
    return "Map exactly one column to Phone number.";
  const keys = fields.map((field) => field.regularField ?? field.customFieldId);
  return new Set(keys).size === keys.length ? null : "Each contact field can only be mapped once.";
}
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}
function fallbackType(file: File): string {
  return file.name.toLowerCase().endsWith(".xlsx")
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv";
}
const headerMap: Record<string, RegularContactImportField | undefined> = {
  birthday: "BIRTHDAY",
  birthdate: "BIRTHDAY",
  dob: "BIRTHDAY",
  email: "EMAIL",
  emailaddress: "EMAIL",
  firstname: "FIRST_NAME",
  fname: "FIRST_NAME",
  givenname: "FIRST_NAME",
  lastname: "LAST_NAME",
  lname: "LAST_NAME",
  notes: "NOTES",
  phone: "PHONE_NUMBER",
  phonenumber: "PHONE_NUMBER",
  mobile: "PHONE_NUMBER",
  mobilenumber: "PHONE_NUMBER",
};
