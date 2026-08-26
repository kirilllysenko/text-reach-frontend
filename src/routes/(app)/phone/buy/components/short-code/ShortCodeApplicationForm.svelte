<script lang="ts">
  import { Button, Field, FieldError, FieldLabel, Input, TextArea } from "$lib";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { createShortCodeApplicationForm, type SubmitValues } from "./form.svelte";

  interface Props {
    onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>;
  }

  let { onSubmit }: Props = $props();

  const shortCodeTypeOptions = [
    {
      description: "The carrier assigns an available code.",
      label: "Random",
      value: "RANDOM",
    },
    {
      description: "Request a specific 5 or 6 digit code.",
      label: "Vanity",
      value: "VANITY",
    },
  ] as const;
  const form = createShortCodeApplicationForm((values) => onSubmit(values));
</script>

<form class="mt-5" onsubmit={form.submit} inert={form.loading || undefined} aria-busy={form.loading}>
  <section>
    <h3 class="text-base font-semibold text-slate-800">Code preference</h3>
    <p class="mt-1 text-sm text-slate-500">Choose whether the carrier should assign a code or review your request.</p>

    <div class="mt-3 grid gap-3 sm:grid-cols-2">
      {#each shortCodeTypeOptions as option (option.value)}
        <button
          id={`short-code-type-${option.value.toLowerCase()}`}
          type="button"
          aria-pressed={form.shortCodeType.value === option.value}
          class={[
            `rounded-2xl border p-4 text-left shadow-sm transition-colors focus-visible:outline-2
            focus-visible:outline-sky-500`,
            form.shortCodeType.value === option.value
              ? "border-sky-300 bg-sky-50/90"
              : "border-white/80 bg-white/70 hover:bg-white",
          ]}
          onclick={() => (form.shortCodeType.value = option.value)}
        >
          <span class="block font-semibold text-slate-800">{option.label}</span>
          <span class="mt-1 block text-sm text-slate-500">{option.description}</span>
        </button>
      {/each}
    </div>

    {#if form.shortCodeType.value === "VANITY"}
      <Field class="mt-4">
        <FieldLabel for="short-code-requested-code">Requested short code</FieldLabel>
        <Input
          id="short-code-requested-code"
          bind:value={form.requestedShortCode.value}
          inputmode="numeric"
          maxlength={6}
          placeholder="54321"
          error={form.requestedShortCode.error}
        />
        <FieldError error={form.requestedShortCode.error} />
      </Field>
    {/if}
  </section>

  <section class="mt-6 border-t border-slate-200/80 pt-5">
    <h3 class="text-base font-semibold text-slate-800">Messaging program</h3>
    <p class="mt-1 text-sm text-slate-500">Describe what subscribers receive and how they give consent.</p>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel for="short-code-use-case">Use case</FieldLabel>
        <Input
          id="short-code-use-case"
          bind:value={form.useCase.value}
          maxlength={255}
          placeholder="Customer care and account alerts"
          error={form.useCase.error}
        />
        <FieldError error={form.useCase.error} />
      </Field>

      <Field>
        <FieldLabel for="short-code-monthly-volume">Estimated monthly messages</FieldLabel>
        <Input
          id="short-code-monthly-volume"
          bind:value={form.estimatedMonthlyVolume.value}
          inputmode="numeric"
          min="1"
          placeholder="25000"
          type="number"
          error={form.estimatedMonthlyVolume.error}
        />
        <FieldError error={form.estimatedMonthlyVolume.error} />
      </Field>
    </div>

    <Field class="mt-4">
      <FieldLabel for="short-code-description">Program description</FieldLabel>
      <TextArea
        id="short-code-description"
        bind:value={form.description.value}
        maxlength={2000}
        rows={4}
        placeholder="Explain the messages your organization will send and who receives them."
        aria-invalid={!!form.description.error}
      />
      <FieldError error={form.description.error} />
    </Field>

    <Field class="mt-4">
      <FieldLabel for="short-code-message-flow">Opt-in and message flow</FieldLabel>
      <TextArea
        id="short-code-message-flow"
        bind:value={form.messageFlow.value}
        maxlength={2000}
        rows={5}
        placeholder="Describe every step from consent through the first message, including required disclosures."
        aria-invalid={!!form.messageFlow.error}
      />
      <FieldError error={form.messageFlow.error} />
    </Field>

    <Field class="mt-4">
      <FieldLabel for="short-code-consent-evidence">Consent evidence URLs</FieldLabel>
      <TextArea
        id="short-code-consent-evidence"
        bind:value={form.optInEvidenceUrls.value}
        rows={3}
        placeholder="https://example.com/signup\nhttps://example.com/consent.pdf"
        aria-describedby="short-code-consent-evidence-help"
        aria-invalid={!!form.optInEvidenceUrls.error}
      />
      <p id="short-code-consent-evidence-help" class="text-xs text-slate-500">
        Add one complete URL per line. Include screenshots or documents for any opt-in path that is not public.
      </p>
      <FieldError error={form.optInEvidenceUrls.error} />
    </Field>
  </section>

  <section class="mt-6 border-t border-slate-200/80 pt-5">
    <h3 class="text-base font-semibold text-slate-800">Example messages and keywords</h3>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel for="short-code-sample-message-1">Sample message 1</FieldLabel>
        <TextArea
          id="short-code-sample-message-1"
          bind:value={form.sampleMessage1.value}
          maxlength={1600}
          rows={4}
          placeholder="Your account update is ready. Reply STOP to opt out."
          aria-invalid={!!form.sampleMessage1.error}
        />
        <FieldError error={form.sampleMessage1.error} />
      </Field>

      <Field>
        <FieldLabel for="short-code-sample-message-2">Sample message 2</FieldLabel>
        <TextArea
          id="short-code-sample-message-2"
          bind:value={form.sampleMessage2.value}
          maxlength={1600}
          rows={4}
          placeholder="We received your request. Reply HELP for help."
          aria-invalid={!!form.sampleMessage2.error}
        />
        <FieldError error={form.sampleMessage2.error} />
      </Field>

      <Field>
        <FieldLabel for="short-code-opt-in-keywords">Opt-in keywords</FieldLabel>
        <Input
          id="short-code-opt-in-keywords"
          bind:value={form.optInKeywords.value}
          maxlength={255}
          placeholder="START, YES"
        />
      </Field>

      <Field>
        <FieldLabel for="short-code-opt-out-keywords">Opt-out keywords</FieldLabel>
        <Input
          id="short-code-opt-out-keywords"
          bind:value={form.optOutKeywords.value}
          maxlength={255}
          placeholder="STOP, END, CANCEL"
        />
      </Field>

      <Field>
        <FieldLabel for="short-code-help-keywords">Help keywords</FieldLabel>
        <Input
          id="short-code-help-keywords"
          bind:value={form.helpKeywords.value}
          maxlength={255}
          placeholder="HELP, INFO"
        />
      </Field>

      <Field>
        <FieldLabel for="short-code-help-message">Help response</FieldLabel>
        <TextArea
          id="short-code-help-message"
          bind:value={form.helpMessage.value}
          maxlength={500}
          rows={3}
          aria-invalid={!!form.helpMessage.error}
        />
        <FieldError error={form.helpMessage.error} />
      </Field>
    </div>
  </section>

  <FieldError class="mt-4" error={form.error} />

  <div class="mt-5 flex justify-end">
    <Button id="short-code-application-submit" submit spinner={form.loading} disabled={form.loading}>
      Submit application
    </Button>
  </div>
</form>
