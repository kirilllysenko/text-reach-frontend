import { createSignal, For, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import type { CreateShortCodeApplicationInput, ShortCodeType } from "~/gql/graphql";
import { Button, Field, FieldError, FieldLabel, Input, TextArea } from "~/components";
import { classes } from "~/lib/styles/classes";

interface FormState {
  description: string;
  estimatedMonthlyVolume: string;
  helpKeywords: string;
  helpMessage: string;
  messageFlow: string;
  optInEvidenceUrls: string;
  optInKeywords: string;
  optOutKeywords: string;
  requestedShortCode: string;
  sampleMessage1: string;
  sampleMessage2: string;
  shortCodeType: ShortCodeType;
  useCase: string;
}
export function ShortCodeForm(props: { onSubmit: (input: CreateShortCodeApplicationInput) => Promise<boolean> }) {
  const [form, setForm] = createStore<FormState>({
    description: "",
    estimatedMonthlyVolume: "",
    helpKeywords: "HELP, INFO",
    helpMessage: "Reply HELP for help. Message and data rates may apply.",
    messageFlow: "",
    optInEvidenceUrls: "",
    optInKeywords: "START, YES",
    optOutKeywords: "STOP, END, CANCEL, UNSUBSCRIBE",
    requestedShortCode: "",
    sampleMessage1: "",
    sampleMessage2: "",
    shortCodeType: "RANDOM",
    useCase: "",
  });
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [saving, setSaving] = createSignal(false);
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    await props.onSubmit({
      description: form.description.trim(),
      estimatedMonthlyVolume: Number(form.estimatedMonthlyVolume),
      helpKeywords: split(form.helpKeywords),
      helpMessage: form.helpMessage.trim(),
      messageFlow: form.messageFlow.trim(),
      optInEvidenceUrls: form.optInEvidenceUrls
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      optInKeywords: split(form.optInKeywords),
      optOutKeywords: split(form.optOutKeywords),
      requestedShortCode: form.shortCodeType === "VANITY" ? form.requestedShortCode : null,
      sampleMessages: [form.sampleMessage1.trim(), form.sampleMessage2.trim()],
      shortCodeType: form.shortCodeType,
      useCase: form.useCase.trim(),
    });
    setSaving(false);
  }
  return (
    <form class="mt-5" onSubmit={(event) => void submit(event)}>
      <h3 class="font-semibold">Code preference</h3>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <For each={["RANDOM", "VANITY"] as ShortCodeType[]}>
          {(type) => (
            <button
              type="button"
              class={classes([
                "rounded-2xl border p-4 text-left",
                form.shortCodeType === type ? "border-sky-300 bg-sky-50" : "border-white bg-white/70",
              ])}
              onClick={() => setForm("shortCodeType", type)}
            >
              <strong>{type === "RANDOM" ? "Random" : "Vanity"}</strong>
              <span class="mt-1 block text-sm text-slate-500">
                {type === "RANDOM" ? "Carrier assigned" : "Request a 5 or 6 digit code"}
              </span>
            </button>
          )}
        </For>
      </div>
      <Show when={form.shortCodeType === "VANITY"}>
        <ShortField
          field="requestedShortCode"
          label="Requested short code"
          form={form}
          setForm={setForm}
          errors={errors()}
        />
      </Show>
      <section class="mt-6 border-t pt-5">
        <h3 class="font-semibold">Messaging program</h3>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <ShortField field="useCase" label="Use case" form={form} setForm={setForm} errors={errors()} />
          <ShortField
            field="estimatedMonthlyVolume"
            label="Estimated monthly messages"
            form={form}
            setForm={setForm}
            errors={errors()}
            type="number"
          />
          <ShortField
            area
            wide
            field="description"
            label="Program description"
            form={form}
            setForm={setForm}
            errors={errors()}
          />
          <ShortField
            area
            wide
            field="messageFlow"
            label="Opt-in and message flow"
            form={form}
            setForm={setForm}
            errors={errors()}
          />
          <ShortField
            area
            wide
            field="optInEvidenceUrls"
            label="Consent evidence URLs (one per line)"
            form={form}
            setForm={setForm}
            errors={errors()}
          />
        </div>
      </section>
      <section class="mt-6 border-t pt-5">
        <h3 class="font-semibold">Samples and keywords</h3>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <ShortField
            area
            field="sampleMessage1"
            label="Sample message 1"
            form={form}
            setForm={setForm}
            errors={errors()}
          />
          <ShortField
            area
            field="sampleMessage2"
            label="Sample message 2"
            form={form}
            setForm={setForm}
            errors={errors()}
          />
          <ShortField field="optInKeywords" label="Opt-in keywords" form={form} setForm={setForm} errors={errors()} />
          <ShortField field="optOutKeywords" label="Opt-out keywords" form={form} setForm={setForm} errors={errors()} />
          <ShortField field="helpKeywords" label="Help keywords" form={form} setForm={setForm} errors={errors()} />
          <ShortField area field="helpMessage" label="Help response" form={form} setForm={setForm} errors={errors()} />
        </div>
      </section>
      <FieldError class="mt-4" error={errors().form} />
      <div class="mt-5 flex justify-end">
        <Button submit spinner={saving()}>
          Submit application
        </Button>
      </div>
    </form>
  );
}
function ShortField(props: {
  area?: boolean;
  errors: Record<string, string>;
  field: keyof FormState;
  form: FormState;
  label: string;
  setForm: ReturnType<typeof createStore<FormState>>[1];
  type?: string;
  wide?: boolean;
}) {
  return (
    <Field class={classes(["mt-4", props.wide && "sm:col-span-2"])}>
      <FieldLabel for={`short-${props.field}`}>{props.label}</FieldLabel>
      <Show
        when={props.area}
        fallback={
          <Input
            id={`short-${props.field}`}
            type={props.type ?? "text"}
            value={String(props.form[props.field])}
            error={props.errors[props.field]}
            onInput={(event) => props.setForm(props.field, event.currentTarget.value as never)}
          />
        }
      >
        <TextArea
          id={`short-${props.field}`}
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
    "estimatedMonthlyVolume",
    "helpMessage",
    "messageFlow",
    "optInEvidenceUrls",
    "sampleMessage1",
    "sampleMessage2",
    "useCase",
  ] as const)
    if (!form[field].trim()) errors[field] = "Required";
  const volume = Number(form.estimatedMonthlyVolume);
  if (!Number.isInteger(volume) || volume <= 0)
    errors.estimatedMonthlyVolume = "Enter a whole number greater than zero";
  if (form.shortCodeType === "VANITY" && !/^\d{5,6}$/.test(form.requestedShortCode))
    errors.requestedShortCode = "Enter a 5 or 6 digit short code";
  for (const value of form.optInEvidenceUrls
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean))
    try {
      new URL(value);
    } catch {
      errors.optInEvidenceUrls = "Enter complete URLs, one per line";
    }
  return errors;
}
function split(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}
