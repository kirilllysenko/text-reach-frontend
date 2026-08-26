import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, For, onSettled, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import {
  CampaignFormContactGroupsDocument,
  CampaignFormSenderPhonesDocument,
  CampaignMediaUploadUrlDocument,
  CreateCampaignDocument,
  type CampaignFormContactGroupsQuery,
  type CampaignFormSenderPhonesQuery,
  type CreateCampaignInput,
} from "~/gql/graphql";
import { PATH_CAMPAIGN } from "~/lib/app/paths";
import { Button, Card, Field, FieldError, FieldLabel, Input, PageTitle, TextArea } from "~/components";
import { formatPhoneNumber } from "~/lib/feature/phone/phone-display";
import { graphqlClient } from "~/lib/graphql/client";
import { classes } from "~/lib/styles/classes";
import { showInfo } from "~/lib/state/notifications";

type ContactGroup = CampaignFormContactGroupsQuery["contactGroups"]["edges"][number]["node"];
type SenderPhone = CampaignFormSenderPhonesQuery["tenantPhones"]["edges"][number]["node"];
type ScheduleType = "now" | "once" | "recurring";
type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

interface CampaignMediaDraft {
  contentType: string;
  filename: string;
  id: string;
  previewUrl: string;
  sizeBytes: number;
  url: string;
}

interface FormState {
  contactGroupIds: string[];
  media: CampaignMediaDraft[];
  messageTemplate: string;
  name: string;
  recurrenceCount: string;
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceInterval: string;
  scheduledAt: string;
  scheduleType: ScheduleType;
  tenantPhoneId: string;
}

type ErrorState = Partial<Record<keyof FormState | "form" | "upload", string>>;

const personalizationFields = [
  ["First name", "firstName"],
  ["Last name", "lastName"],
  ["Email", "email"],
  ["Phone", "phoneNumber"],
  ["Birthday", "birthday"],
] as const;

export default function CampaignAddPage() {
  const navigate = useNavigate();
  const [form, setForm] = createStore<FormState>({
    contactGroupIds: [],
    media: [],
    messageTemplate: "",
    name: "",
    recurrenceCount: "2",
    recurrenceFrequency: "WEEKLY",
    recurrenceInterval: "1",
    scheduledAt: "",
    scheduleType: "now",
    tenantPhoneId: "",
  });
  const [errors, setErrors] = createStore<ErrorState>({});
  const [groups, setGroups] = createSignal<ContactGroup[]>([]);
  const [phones, setPhones] = createSignal<SenderPhone[]>([]);
  const [loadingOptions, setLoadingOptions] = createSignal(true);
  const [submitting, setSubmitting] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
  const senderPhone = createMemo(() => phones().find((phone) => phone.id === form.tenantPhoneId));
  const previewText = createMemo(() => previewMessage(form.messageTemplate));

  onSettled(() => {
    void loadOptions();
    return () => form.media.forEach((media) => URL.revokeObjectURL(media.previewUrl));
  });

  async function loadOptions(): Promise<void> {
    setLoadingOptions(true);
    setErrors({ form: undefined });
    try {
      const [groupResponse, phoneResponse] = await Promise.all([
        graphqlClient.query(CampaignFormContactGroupsDocument, {}, { requestPolicy: "network-only" }),
        graphqlClient.query(CampaignFormSenderPhonesDocument, {}, { requestPolicy: "network-only" }),
      ]);
      if (groupResponse.error || phoneResponse.error || !groupResponse.data || !phoneResponse.data) throw new Error();
      const nextGroups = groupResponse.data.contactGroups.edges.map((edge) => edge.node);
      const nextPhones = phoneResponse.data.tenantPhones.edges.map((edge) => edge.node);
      setGroups(nextGroups);
      setPhones(nextPhones);
      if (!form.tenantPhoneId && nextPhones[0]) setForm("tenantPhoneId", nextPhones[0].id);
    } catch {
      setErrors({ form: "Could not load campaign options." });
    } finally {
      setLoadingOptions(false);
    }
  }

  function setScheduleType(scheduleType: ScheduleType): void {
    setForm("scheduleType", scheduleType);
    if (scheduleType !== "now" && !form.scheduledAt) setForm("scheduledAt", nextAvailableTime());
  }

  function toggleGroup(groupId: string): void {
    setForm("contactGroupIds", (ids) =>
      ids.includes(groupId) ? ids.filter((current) => current !== groupId) : [...ids, groupId],
    );
    setErrors("contactGroupIds", undefined);
  }

  function insertPersonalization(field: string): void {
    setForm("messageTemplate", `${form.messageTemplate}{{${field}}}`);
    setErrors("messageTemplate", undefined);
  }

  async function selectImages(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const selectedFiles = [...(input.files ?? [])];
    input.value = "";
    if (selectedFiles.length === 0) return;
    const remaining = Math.max(10 - form.media.length, 0);
    const files = selectedFiles.slice(0, remaining);
    setErrors("upload", selectedFiles.length > remaining ? "A campaign can include at most 10 images." : undefined);
    setUploading(true);
    try {
      for (const file of files) await uploadImage(file);
    } finally {
      setUploading(false);
    }
  }

  async function uploadImage(file: File): Promise<void> {
    const contentType = campaignImageContentType(file);
    if (!contentType) {
      setErrors("upload", `${file.name} is not a supported image.`);
      return;
    }
    try {
      const response = await graphqlClient.query(
        CampaignMediaUploadUrlDocument,
        { filename: file.name },
        { requestPolicy: "network-only" },
      );
      const upload = response.data?.campaignMediaUploadUrl;
      if (response.error || !upload) throw new Error();
      const uploadResponse = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error();
      setForm("media", (current) => [
        ...current,
        {
          contentType,
          filename: file.name,
          id: crypto.randomUUID(),
          previewUrl: URL.createObjectURL(file),
          sizeBytes: file.size,
          url: upload.mediaUrl,
        },
      ]);
    } catch {
      setErrors("upload", `Could not upload ${file.name}.`);
    }
  }

  function removeImage(media: CampaignMediaDraft): void {
    URL.revokeObjectURL(media.previewUrl);
    setForm("media", (current) => current.filter((item) => item.id !== media.id));
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const nextErrors = validateCampaign(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    try {
      const response = await graphqlClient.mutation(CreateCampaignDocument, { input: toCampaignInput(form) });
      if (response.error || !response.data?.createCampaign) {
        setErrors("form", "There was an error.");
        return;
      }
      showInfo(form.scheduleType === "now" ? "Campaign has been queued for sending." : "Campaign has been scheduled.");
      navigate(form.scheduleType === "now" ? PATH_CAMPAIGN : `${PATH_CAMPAIGN}?view=schedule`);
    } catch {
      setErrors("form", "Could not create the campaign. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Create campaign">
        <a href={PATH_CAMPAIGN} class="text-sm font-medium text-sky-700">
          Back to campaigns
        </a>
      </PageTitle>
      <div class="min-h-0 grow overflow-y-auto pb-8">
        <div class="mx-auto grid w-full max-w-7xl items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card variant="panel" class="min-w-0 p-4 sm:p-6">
            <form onSubmit={(event) => void submit(event)} aria-busy={submitting() || uploading() ? "true" : "false"}>
              <h2 class="mb-3 text-base font-semibold text-slate-800">Campaign details</h2>
              <div class="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel for="campaign-name">
                    Campaign name<span class="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    id="campaign-name"
                    maxlength={200}
                    value={form.name}
                    error={errors.name}
                    onInput={(event) => setForm("name", event.currentTarget.value)}
                  />
                  <FieldError error={errors.name} />
                </Field>
                <Field>
                  <FieldLabel for="campaign-sender">
                    Send from<span class="text-rose-500">*</span>
                  </FieldLabel>
                  <select
                    id="campaign-sender"
                    class="glass-input h-10 w-full px-3 text-sm text-slate-700"
                    disabled={loadingOptions() || phones().length === 0}
                    value={form.tenantPhoneId}
                    onChange={(event) => setForm("tenantPhoneId", event.currentTarget.value)}
                  >
                    <For each={phones()}>
                      {(phone) => <option value={phone.id}>{formatPhoneNumber(phone.phoneNumber)}</option>}
                    </For>
                  </select>
                  <FieldError error={errors.tenantPhoneId} />
                </Field>
              </div>

              <section class="mt-5" aria-labelledby="campaign-groups-title">
                <h2 id="campaign-groups-title" class="mb-2 text-sm font-medium text-slate-700">
                  Contact groups<span class="text-rose-500">*</span>
                </h2>
                <div class="grid gap-2 sm:grid-cols-2">
                  <For each={groups()}>
                    {(group) => (
                      <label class="flex items-center gap-3 rounded-xl border border-white/80 bg-white/75 p-3 shadow-sm">
                        <input
                          type="checkbox"
                          checked={form.contactGroupIds.includes(group.id)}
                          onChange={() => toggleGroup(group.id)}
                        />
                        <span class="min-w-0 grow truncate text-sm font-medium text-slate-700">{group.name}</span>
                        <span class="text-xs text-slate-500">{group.contactCount.toLocaleString()}</span>
                      </label>
                    )}
                  </For>
                </div>
                <Show when={!loadingOptions() && groups().length === 0}>
                  <p class="text-amber-700 text-sm">No contact groups are available.</p>
                </Show>
                <FieldError class="mt-2" error={errors.contactGroupIds} />
              </section>

              <section class="mt-5 border-t border-slate-200/80 pt-5" aria-labelledby="campaign-message-title">
                <div class="mb-2 flex items-center justify-between">
                  <h2 id="campaign-message-title" class="text-base font-semibold text-slate-800">
                    Message
                  </h2>
                  <span class="rounded-lg bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
                    {form.media.length ? "MMS" : "SMS"}
                  </span>
                </div>
                <TextArea
                  id="campaign-message"
                  rows={6}
                  maxlength={5000}
                  value={form.messageTemplate}
                  error={errors.messageTemplate}
                  onInput={(event) => setForm("messageTemplate", event.currentTarget.value)}
                />
                <div class="mt-2 flex flex-wrap gap-2">
                  <For each={personalizationFields}>
                    {([label, field]) => (
                      <Button small variant="secondary" onClick={() => insertPersonalization(field)}>
                        {label}
                      </Button>
                    )}
                  </For>
                </div>
                <FieldError class="mt-2" error={errors.messageTemplate} />
                <div class="mt-4 flex items-center justify-between gap-3">
                  <label class="cursor-pointer rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    {uploading() ? "Uploading…" : "Add images"}
                    <input
                      class="hidden"
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                      multiple
                      disabled={uploading() || form.media.length >= 10}
                      onChange={(event) => void selectImages(event)}
                    />
                  </label>
                  <span class="text-xs text-slate-500">{form.media.length} of 10</span>
                </div>
                <Show when={form.media.length > 0}>
                  <div class="mt-3 grid grid-cols-[repeat(auto-fill,7.5rem)] gap-3">
                    <For each={form.media}>
                      {(media) => (
                        <div class="relative overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                          <img class="aspect-square w-full object-cover" src={media.previewUrl} alt={media.filename} />
                          <button
                            type="button"
                            class="absolute top-1 right-1 rounded-full bg-slate-900/75 px-2 py-1 text-xs text-white"
                            aria-label={`Remove ${media.filename}`}
                            onClick={() => removeImage(media)}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
                <FieldError class="mt-2" error={errors.upload} />
              </section>

              <ScheduleFields form={form} setForm={setForm} errors={errors} onSelectType={setScheduleType} />
              <FieldError class="mt-4" error={errors.form} />
              <div class="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => navigate(PATH_CAMPAIGN)}>
                  Cancel
                </Button>
                <Button submit spinner={submitting()} disabled={uploading()}>
                  {form.scheduleType === "now" ? "Create & send" : "Schedule campaign"}
                </Button>
              </div>
            </form>
          </Card>
          <MessagePreview
            message={previewText()}
            media={form.media}
            sender={senderPhone()?.phoneNumber ?? "Sending number"}
          />
        </div>
      </div>
    </div>
  );
}

function ScheduleFields(props: {
  form: FormState;
  setForm: ReturnType<typeof createStore<FormState>>[1];
  errors: ErrorState;
  onSelectType: (type: ScheduleType) => void;
}) {
  return (
    <section class="mt-6 border-t border-slate-200/80 pt-5" aria-labelledby="campaign-schedule-title">
      <h2 id="campaign-schedule-title" class="text-base font-semibold text-slate-800">
        Schedule
      </h2>
      <div class="mt-3 grid gap-2 sm:grid-cols-3">
        <For each={["now", "once", "recurring"] as ScheduleType[]}>
          {(type) => (
            <label
              class={classes([
                "cursor-pointer rounded-xl border px-3 py-3",
                props.form.scheduleType === type
                  ? "border-sky-300 bg-sky-50/90 shadow-sm"
                  : "border-slate-200 bg-white/70",
              ])}
            >
              <input
                class="sr-only"
                type="radio"
                name="campaign-schedule"
                checked={props.form.scheduleType === type}
                onChange={() => props.onSelectType(type)}
              />
              <span class="block text-sm font-medium text-slate-800">
                {type === "now" ? "Send now" : type === "once" ? "Schedule once" : "Recurring"}
              </span>
            </label>
          )}
        </For>
      </div>
      <Show when={props.form.scheduleType !== "now"}>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel for="campaign-scheduled-at">
              First send<span class="text-rose-500">*</span>
            </FieldLabel>
            <Input
              id="campaign-scheduled-at"
              type="datetime-local"
              value={props.form.scheduledAt}
              error={props.errors.scheduledAt}
              onInput={(event) => props.setForm("scheduledAt", event.currentTarget.value)}
            />
            <FieldError error={props.errors.scheduledAt} />
          </Field>
          <Show when={props.form.scheduleType === "recurring"}>
            <Field>
              <FieldLabel for="campaign-frequency">Repeat</FieldLabel>
              <select
                id="campaign-frequency"
                class="glass-input h-10 w-full px-3 text-sm text-slate-700"
                value={props.form.recurrenceFrequency}
                onChange={(event) =>
                  props.setForm("recurrenceFrequency", event.currentTarget.value as RecurrenceFrequency)
                }
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </Field>
            <Field>
              <FieldLabel for="campaign-interval">Repeat every</FieldLabel>
              <Input
                id="campaign-interval"
                type="number"
                min="1"
                max="100"
                value={props.form.recurrenceInterval}
                onInput={(event) => props.setForm("recurrenceInterval", event.currentTarget.value)}
              />
              <FieldError error={props.errors.recurrenceInterval} />
            </Field>
            <Field>
              <FieldLabel for="campaign-count">Occurrences</FieldLabel>
              <Input
                id="campaign-count"
                type="number"
                min="2"
                max="365"
                value={props.form.recurrenceCount}
                onInput={(event) => props.setForm("recurrenceCount", event.currentTarget.value)}
              />
              <FieldError error={props.errors.recurrenceCount} />
            </Field>
          </Show>
        </div>
      </Show>
    </section>
  );
}

function MessagePreview(props: { media: CampaignMediaDraft[]; message: string; sender: string }) {
  return (
    <aside class="min-w-0 lg:sticky lg:top-0" aria-label="Message preview">
      <Card variant="panel" class="p-4">
        <h2 class="mb-4 text-base font-semibold text-slate-800">Message preview</h2>
        <div class="mx-auto flex aspect-[9/17] w-full max-w-66 flex-col overflow-hidden rounded-[2.75rem] border-[0.6rem] border-slate-900 bg-white shadow-xl">
          <div class="flex h-15 shrink-0 items-end justify-center border-b border-slate-200 bg-slate-50 px-3 pb-3">
            <p class="truncate text-xs font-semibold text-slate-800">{formatPhoneNumber(props.sender)}</p>
          </div>
          <div class="min-h-0 grow overflow-y-auto p-3">
            <Show
              when={props.message || props.media.length > 0}
              fallback={
                <div class="grid h-full place-items-center text-center text-xs text-slate-400">
                  Your preview appears here.
                </div>
              }
            >
              <div class="max-w-[88%] rounded-2xl rounded-bl-md bg-slate-100 p-2.5 text-sm text-slate-800">
                <Show when={props.media[0]}>
                  {(media) => (
                    <img
                      class="mb-2 aspect-square w-full rounded-xl object-cover"
                      src={media().previewUrl}
                      alt={media().filename}
                    />
                  )}
                </Show>
                <p class="break-words whitespace-pre-wrap">{props.message || "Image attachment"}</p>
              </div>
            </Show>
          </div>
        </div>
      </Card>
    </aside>
  );
}

function validateCampaign(form: FormState): ErrorState {
  const errors: ErrorState = {};
  if (!form.name.trim()) errors.name = "Required";
  if (!form.tenantPhoneId) errors.tenantPhoneId = "Select a sending number";
  if (form.contactGroupIds.length === 0) errors.contactGroupIds = "Add at least one contact group";
  if (!form.messageTemplate.trim()) errors.messageTemplate = "Required";
  if (form.scheduleType !== "now") {
    const date = new Date(form.scheduledAt);
    if (!form.scheduledAt || Number.isNaN(date.getTime())) errors.scheduledAt = "Choose a date and time";
    else if (date.getTime() <= Date.now()) errors.scheduledAt = "Choose a future date and time";
  }
  if (form.scheduleType === "recurring") {
    if (!wholeNumberBetween(form.recurrenceInterval, 1, 100)) errors.recurrenceInterval = "Use 1–100";
    if (!wholeNumberBetween(form.recurrenceCount, 2, 365)) errors.recurrenceCount = "Use 2–365";
  }
  return errors;
}

function toCampaignInput(form: FormState): CreateCampaignInput {
  const input: CreateCampaignInput = {
    contactGroupIds: [...form.contactGroupIds],
    media: form.media.map(({ contentType, sizeBytes, url }) => ({ contentType, sizeBytes, url })),
    messageTemplate: form.messageTemplate.trim(),
    name: form.name.trim(),
    tenantPhoneId: form.tenantPhoneId,
  };
  if (form.scheduleType === "once") input.scheduledAt = new Date(form.scheduledAt).toISOString();
  if (form.scheduleType === "recurring") input.recurrenceRule = buildRecurrenceRule(form);
  return input;
}

function buildRecurrenceRule(form: FormState): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const dateTime = form.scheduledAt.replaceAll("-", "").replaceAll(":", "");
  const start = dateTime.length === 13 ? `${dateTime}00` : dateTime;
  return `DTSTART;TZID=${timeZone}:${start}\nRRULE:FREQ=${form.recurrenceFrequency};INTERVAL=${Number(form.recurrenceInterval)};COUNT=${Number(form.recurrenceCount)}`;
}

function previewMessage(message: string): string {
  return message
    .replaceAll("{{firstName}}", "Avery")
    .replaceAll("{{lastName}}", "Johnson")
    .replaceAll("{{email}}", "avery@example.com")
    .replaceAll("{{phoneNumber}}", "+1 415 555 0127")
    .replaceAll("{{birthday}}", "December 10, 1990");
}

function nextAvailableTime(): string {
  const date = new Date(Date.now() + 60 * 60 * 1_000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function wholeNumberBetween(value: string, minimum: number, maximum: number): boolean {
  const number = Number(value);
  return Number.isInteger(number) && number >= minimum && number <= maximum;
}

function campaignImageContentType(file: File): string | null {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"];
  if (allowed.includes(file.type.toLowerCase())) return file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase();
  const byExtension: Record<string, string> = {
    bmp: "image/bmp",
    gif: "image/gif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return extension ? (byExtension[extension] ?? null) : null;
}
