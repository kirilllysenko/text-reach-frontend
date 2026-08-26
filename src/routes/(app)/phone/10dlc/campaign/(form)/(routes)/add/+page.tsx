import { useNavigate } from "@solidjs/router";
import { createSignal, For, onSettled, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import {
  CreateTenDlcCampaignDocument,
  TenDlcCampaignBrandDocument,
  TenDlcCampaignDocumentUploadUrlDocument,
  type TenDlcCampaignInput,
  type TenDlcCampaignBrandQuery,
} from "~/gql/graphql";
import { PATH_TEN_DLC } from "~/lib/app/paths";
import { Alert, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle, TextArea } from "~/components";
import { tenDlcStatusLabel } from "~/lib/feature/phone/phone-display";
import { graphqlClient } from "~/lib/graphql/client";
import { showInfo } from "~/lib/state/notifications";
type Brand = TenDlcCampaignBrandQuery["tenDlcBrand"];
interface FormState {
  ageGated: boolean;
  description: string;
  directLending: boolean;
  documentUrl: string;
  embeddedLink: boolean;
  embeddedPhone: boolean;
  helpKeywords: string;
  helpMessage: string;
  messageFlow: string;
  numberPool: boolean;
  optInKeywords: string;
  optOutKeywords: string;
  optoutMessage: string;
  sampleMessage1: string;
  sampleMessage2: string;
  termsAndConditions: boolean;
  usecase: string;
}
const usecases = [
  "MIXED",
  "CUSTOMER_CARE",
  "DELIVERY_NOTIFICATION",
  "ACCOUNT_NOTIFICATION",
  "2FA",
  "MARKETING",
  "LOW_VOLUME_MIXED",
  "PUBLIC_SERVICE_ANNOUNCEMENT",
  "SECURITY_ALERT",
  "SOLE_PROPRIETOR",
];
export default function TenDlcCampaignAddPage() {
  const navigate = useNavigate();
  const [brand, setBrand] = createSignal<Brand | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [saving, setSaving] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [form, setForm] = createStore<FormState>({
    ageGated: false,
    description: "",
    directLending: false,
    documentUrl: "",
    embeddedLink: false,
    embeddedPhone: false,
    helpKeywords: "HELP, INFO",
    helpMessage: "Reply HELP for help. Message and data rates may apply.",
    messageFlow: "",
    numberPool: false,
    optInKeywords: "START, YES",
    optOutKeywords: "STOP, END, CANCEL, UNSUBSCRIBE",
    optoutMessage: "You have opted out and will receive no further messages. Reply START to opt back in.",
    sampleMessage1: "",
    sampleMessage2: "",
    termsAndConditions: false,
    usecase: "MIXED",
  });
  onSettled(() => void loadBrand());
  async function loadBrand(): Promise<void> {
    setLoading(true);
    try {
      const response = await graphqlClient.query(TenDlcCampaignBrandDocument, {}, { requestPolicy: "network-only" });
      if (response.error || !response.data?.tenDlcBrand) throw new Error();
      setBrand(response.data.tenDlcBrand);
    } catch {
      setError("Register a 10DLC brand before adding a campaign.");
    } finally {
      setLoading(false);
    }
  }
  async function uploadDocument(file: File): Promise<void> {
    setUploading(true);
    setError(null);
    try {
      const response = await graphqlClient.query(
        TenDlcCampaignDocumentUploadUrlDocument,
        { filename: file.name },
        { requestPolicy: "network-only" },
      );
      const upload = response.data?.campaignMediaUploadUrl;
      if (response.error || !upload) throw new Error();
      const result = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!result.ok) throw new Error();
      setForm("documentUrl", upload.mediaUrl);
    } catch {
      setError("Could not upload consent document.");
    } finally {
      setUploading(false);
    }
  }
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setError(null);
    try {
      const input: TenDlcCampaignInput = {
        ageGated: form.ageGated,
        description: form.description.trim(),
        directLending: form.directLending,
        embeddedLink: form.embeddedLink,
        embeddedPhone: form.embeddedPhone,
        helpKeywords: split(form.helpKeywords),
        helpMessage: form.helpMessage.trim(),
        messageFlow: `${form.messageFlow.trim()}\nConsent documentation: ${form.documentUrl}`,
        numberPool: form.numberPool,
        optInKeywords: split(form.optInKeywords),
        optOutKeywords: split(form.optOutKeywords),
        optoutMessage: form.optoutMessage.trim(),
        sampleMessages: [form.sampleMessage1.trim(), form.sampleMessage2.trim()],
        subscriberHelp: true,
        subscriberOptIn: true,
        subscriberOptOut: true,
        termsAndConditions: true,
        usecase: form.usecase,
      };
      const response = await graphqlClient.mutation(CreateTenDlcCampaignDocument, { input });
      if (response.error || !response.data?.createTenDlcCampaign) throw new Error();
      showInfo("10DLC campaign registration submitted.");
      navigate(PATH_TEN_DLC);
    } catch {
      setError("Could not submit 10DLC campaign registration.");
    } finally {
      setSaving(false);
    }
  }
  const verified = () =>
    !brand()?.providerStatus || ["VERIFIED", "VETTED_VERIFIED"].includes(brand()!.providerStatus!.toUpperCase());
  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Register 10DLC campaign">
        <a href={PATH_TEN_DLC} class="text-sm font-medium text-sky-700">
          10DLC
        </a>
      </PageTitle>
      <div class="flex min-h-0 grow justify-center overflow-y-auto pt-2 pb-18">
        <Card variant="panel" class="h-fit w-full max-w-4xl p-4 sm:p-6">
          <Show
            when={!error() || brand()}
            fallback={
              <Alert type="warning" layout="inline">
                {error()}
              </Alert>
            }
          >
            <Show
              when={loading() || verified()}
              fallback={
                <Alert type="warning" layout="inline">
                  {brand()?.name} is {tenDlcStatusLabel(brand()?.providerStatus).toLowerCase()}. Registration is
                  available after verification.
                </Alert>
              }
            >
              <form onSubmit={(event) => void submit(event)} aria-busy={loading() || saving() ? "true" : "false"}>
                <Section title="Messaging use case">
                  <div class="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel for="ten-dlc-usecase">Use case</FieldLabel>
                      <select
                        id="ten-dlc-usecase"
                        class="glass-input h-10 w-full px-3"
                        value={form.usecase}
                        onChange={(event) => setForm("usecase", event.currentTarget.value)}
                      >
                        <For each={usecases}>
                          {(usecase) => <option value={usecase}>{usecase.replaceAll("_", " ")}</option>}
                        </For>
                      </select>
                    </Field>
                    <TextField
                      area
                      field="description"
                      label="Description"
                      form={form}
                      setForm={setForm}
                      errors={errors()}
                    />
                  </div>
                </Section>
                <Section title="Consent and opt-in">
                  <div class="grid gap-4 sm:grid-cols-2">
                    <TextField
                      area
                      wide
                      field="messageFlow"
                      label="How customers opt in"
                      form={form}
                      setForm={setForm}
                      errors={errors()}
                    />
                    <Field>
                      <FieldLabel for="consent-document">Consent document</FieldLabel>
                      <input
                        id="consent-document"
                        type="file"
                        disabled={uploading()}
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          if (file) void uploadDocument(file);
                        }}
                      />
                      <p class="mt-1 text-xs text-slate-500">
                        {form.documentUrl ? "Uploaded" : uploading() ? "Uploading…" : "Required"}
                      </p>
                      <FieldError error={errors().documentUrl} />
                    </Field>
                    <TextField
                      field="optInKeywords"
                      label="Opt-in keywords"
                      form={form}
                      setForm={setForm}
                      errors={errors()}
                    />
                  </div>
                </Section>
                <Section title="Message samples">
                  <div class="grid gap-4 sm:grid-cols-2">
                    <TextField
                      area
                      field="sampleMessage1"
                      label="Sample message 1"
                      form={form}
                      setForm={setForm}
                      errors={errors()}
                    />
                    <TextField
                      area
                      field="sampleMessage2"
                      label="Sample message 2"
                      form={form}
                      setForm={setForm}
                      errors={errors()}
                    />
                  </div>
                </Section>
                <Section title="Help and opt-out">
                  <div class="grid gap-4 sm:grid-cols-2">
                    <TextField
                      field="helpKeywords"
                      label="Help keywords"
                      form={form}
                      setForm={setForm}
                      errors={errors()}
                    />
                    <TextField
                      field="optOutKeywords"
                      label="Opt-out keywords"
                      form={form}
                      setForm={setForm}
                      errors={errors()}
                    />
                    <TextField
                      area
                      field="helpMessage"
                      label="Help response"
                      form={form}
                      setForm={setForm}
                      errors={errors()}
                    />
                    <TextField
                      area
                      field="optoutMessage"
                      label="Opt-out response"
                      form={form}
                      setForm={setForm}
                      errors={errors()}
                    />
                  </div>
                </Section>
                <Section title="Content declarations">
                  <div class="grid gap-2 sm:grid-cols-2">
                    <For
                      each={
                        [
                          ["embeddedLink", "Messages include links"],
                          ["embeddedPhone", "Messages include phone numbers"],
                          ["numberPool", "Campaign uses a number pool"],
                          ["ageGated", "Content is age-gated"],
                          ["directLending", "Campaign concerns direct lending"],
                        ] as Array<[keyof FormState, string]>
                      }
                    >
                      {([field, label]) => (
                        <label class="flex items-center gap-3 rounded-xl bg-white/70 p-3 text-sm">
                          <input
                            type="checkbox"
                            checked={Boolean(form[field])}
                            onChange={(event) => setForm(field, event.currentTarget.checked as never)}
                          />
                          {label}
                        </label>
                      )}
                    </For>
                  </div>
                  <label class="mt-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={form.termsAndConditions}
                      onChange={(event) => setForm("termsAndConditions", event.currentTarget.checked)}
                    />
                    I confirm subscribers opt in, can request help, and can opt out.
                  </label>
                  <FieldError error={errors().termsAndConditions} />
                </Section>
                <FieldError class="mt-4" error={error()} />
                <div class="mt-6 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => navigate(PATH_TEN_DLC)}>
                    Cancel
                  </Button>
                  <Button submit spinner={saving()} disabled={loading() || uploading()}>
                    Submit campaign
                  </Button>
                </div>
              </form>
            </Show>
          </Show>
        </Card>
      </div>
    </div>
  );
}
function Section(props: { children: unknown; title: string }) {
  return (
    <section class="border-b border-slate-200/80 py-5 first:pt-0">
      <h2 class="text-lg font-semibold">{props.title}</h2>
      <div class="mt-4">{props.children as never}</div>
    </section>
  );
}
function TextField(props: {
  area?: boolean;
  errors: Record<string, string>;
  field: keyof FormState;
  form: FormState;
  label: string;
  setForm: ReturnType<typeof createStore<FormState>>[1];
  wide?: boolean;
}) {
  return (
    <Field class={props.wide ? "sm:col-span-2" : undefined}>
      <FieldLabel for={`ten-dlc-${props.field}`}>{props.label}</FieldLabel>
      <Show
        when={props.area}
        fallback={
          <Input
            id={`ten-dlc-${props.field}`}
            value={String(props.form[props.field])}
            error={props.errors[props.field]}
            onInput={(event) => props.setForm(props.field, event.currentTarget.value as never)}
          />
        }
      >
        <TextArea
          id={`ten-dlc-${props.field}`}
          rows={4}
          value={String(props.form[props.field])}
          error={props.errors[props.field]}
          onInput={(event) => props.setForm(props.field, event.currentTarget.value as never)}
        />
      </Show>
      <FieldError error={props.errors[props.field]} />
    </Field>
  );
}
function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of [
    "description",
    "documentUrl",
    "helpKeywords",
    "helpMessage",
    "messageFlow",
    "optOutKeywords",
    "optoutMessage",
    "sampleMessage1",
    "sampleMessage2",
  ] as const)
    if (!form[field].trim()) errors[field] = "Required";
  if (!form.termsAndConditions) errors.termsAndConditions = "Accept the terms and conditions";
  return errors;
}
function split(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
