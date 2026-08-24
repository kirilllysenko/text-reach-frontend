<script lang="ts">
  import { Field, FieldError, FieldLabel, Input } from "$lib";
  import { SvelteDate } from "svelte/reactivity";
  import type { CampaignRecurrenceFrequency, CampaignScheduleType } from "../form/form.svelte";

  interface Props {
    scheduleType: CampaignScheduleType;
    scheduledAt: string;
    recurrenceFrequency: CampaignRecurrenceFrequency;
    recurrenceInterval: string;
    recurrenceCount: string;
    scheduledAtError?: string | null;
    recurrenceIntervalError?: string | null;
    recurrenceCountError?: string | null;
  }

  let {
    scheduleType = $bindable(),
    scheduledAt = $bindable(),
    recurrenceFrequency = $bindable(),
    recurrenceInterval = $bindable(),
    recurrenceCount = $bindable(),
    scheduledAtError = null,
    recurrenceIntervalError = null,
    recurrenceCountError = null,
  }: Props = $props();

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "your device timezone";
  const scheduleOptions: { description: string; label: string; value: CampaignScheduleType }[] = [
    { description: "Queue the campaign immediately", label: "Send now", value: "now" },
    { description: "Send once at a future time", label: "Schedule once", value: "once" },
    { description: "Repeat on a regular cadence", label: "Recurring", value: "recurring" },
  ];

  function selectScheduleType(value: CampaignScheduleType): void {
    scheduleType = value;
    if (value !== "now" && !scheduledAt) {
      scheduledAt = nextAvailableTime();
    }
  }

  function nextAvailableTime(): string {
    const date = new SvelteDate(Date.now() + 60 * 60 * 1_000);
    date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }
</script>

<section class="mt-6 border-t border-slate-200/80 pt-5" aria-labelledby="campaign-schedule-title">
  <div class="mb-3">
    <h2 id="campaign-schedule-title" class="text-base font-semibold text-slate-800">Schedule</h2>
    <p class="mt-1 text-sm text-slate-500">Choose when this campaign should begin.</p>
  </div>

  <fieldset>
    <legend class="sr-only">Campaign schedule type</legend>
    <div class="grid gap-2 sm:grid-cols-3">
      {#each scheduleOptions as option (option.value)}
        <label
          class={[
            `cursor-pointer rounded-xl border px-3 py-3 transition-colors focus-within:ring-2
            focus-within:ring-sky-500/30`,
            scheduleType === option.value
              ? "border-sky-300 bg-sky-50/90 shadow-sm"
              : "border-slate-200 bg-white/70 hover:bg-white",
          ]}
        >
          <input
            id={`campaign-schedule-${option.value}`}
            class="sr-only"
            type="radio"
            name="campaign-schedule-type"
            value={option.value}
            checked={scheduleType === option.value}
            onchange={() => selectScheduleType(option.value)}
          />
          <span class="block text-sm font-medium text-slate-800">{option.label}</span>
          <span class="mt-0.5 block text-xs text-slate-500">{option.description}</span>
        </label>
      {/each}
    </div>
  </fieldset>

  {#if scheduleType !== "now"}
    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel for="campaign-scheduled-at">
          {scheduleType === "recurring" ? "First send" : "Send at"}<span class="text-rose-500">*</span>
        </FieldLabel>
        <Input id="campaign-scheduled-at" type="datetime-local" bind:value={scheduledAt} error={scheduledAtError} />
        <p class="mt-1 text-xs text-slate-500">Time zone: {timeZone}</p>
        <FieldError error={scheduledAtError} />
      </Field>

      {#if scheduleType === "recurring"}
        <Field>
          <FieldLabel for="campaign-recurrence-frequency">Repeat</FieldLabel>
          <select
            id="campaign-recurrence-frequency"
            class="h-10 w-full rounded-[1.05rem] border-none bg-white/70 px-3 text-slate-700 shadow-[inset_0px_0px_7px_3px_rgba(30,41,59,0.1)] focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            bind:value={recurrenceFrequency}
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </Field>

        <Field>
          <FieldLabel for="campaign-recurrence-interval">Repeat every</FieldLabel>
          <Input
            id="campaign-recurrence-interval"
            type="number"
            min="1"
            max="100"
            value={recurrenceInterval}
            error={recurrenceIntervalError}
            oninput={(event) => (recurrenceInterval = event.currentTarget.value)}
          />
          <p class="mt-1 text-xs text-slate-500">
            {recurrenceFrequency === "DAILY" ? "day(s)" : recurrenceFrequency === "WEEKLY" ? "week(s)" : "month(s)"}
          </p>
          <FieldError error={recurrenceIntervalError} />
        </Field>

        <Field>
          <FieldLabel for="campaign-recurrence-count">Occurrences</FieldLabel>
          <Input
            id="campaign-recurrence-count"
            type="number"
            min="2"
            max="365"
            value={recurrenceCount}
            error={recurrenceCountError}
            oninput={(event) => (recurrenceCount = event.currentTarget.value)}
          />
          <p class="mt-1 text-xs text-slate-500">Includes the first send.</p>
          <FieldError error={recurrenceCountError} />
        </Field>
      {/if}
    </div>
  {/if}
</section>
