<script lang="ts">
  import { Field, FieldError, FieldLabel, Input } from "$lib";
  import type { FormValue } from "text-reach-frontend-library/form";
  import { SvelteDate } from "svelte/reactivity";
  import type { CampaignRecurrenceFrequency, CampaignScheduleType } from "../form/form.svelte";

  interface Props {
    scheduleType: FormValue<CampaignScheduleType>;
    scheduledAt: FormValue<string>;
    recurrenceFrequency: FormValue<CampaignRecurrenceFrequency>;
    recurrenceInterval: FormValue<string>;
    recurrenceCount: FormValue<string>;
  }

  let {
    scheduleType = $bindable(),
    scheduledAt = $bindable(),
    recurrenceFrequency = $bindable(),
    recurrenceInterval = $bindable(),
    recurrenceCount = $bindable(),
  }: Props = $props();

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "your device timezone";
  const scheduleOptions: { description: string; label: string; value: CampaignScheduleType }[] = [
    { description: "Queue the campaign immediately", label: "Send now", value: "now" },
    { description: "Send once at a future time", label: "Schedule once", value: "once" },
    { description: "Repeat on a regular cadence", label: "Recurring", value: "recurring" },
  ];

  function selectScheduleType(value: CampaignScheduleType): void {
    scheduleType.value = value;
    if (value !== "now" && !scheduledAt.value) {
      scheduledAt.value = nextAvailableTime();
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
            scheduleType.value === option.value
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
            checked={scheduleType.value === option.value}
            onchange={() => selectScheduleType(option.value)}
          />
          <span class="block text-sm font-medium text-slate-800">{option.label}</span>
          <span class="mt-0.5 block text-xs text-slate-500">{option.description}</span>
        </label>
      {/each}
    </div>
  </fieldset>

  {#if scheduleType.value !== "now"}
    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel for="campaign-scheduled-at">
          {scheduleType.value === "recurring" ? "First send" : "Send at"}<span class="text-rose-500">*</span>
        </FieldLabel>
        <Input id="campaign-scheduled-at" type="datetime-local" field={scheduledAt} />
        <p class="mt-1 text-xs text-slate-500">Time zone: {timeZone}</p>
        <FieldError error={scheduledAt.error} />
      </Field>

      {#if scheduleType.value === "recurring"}
        <Field>
          <FieldLabel for="campaign-recurrence-frequency">Repeat</FieldLabel>
          <select
            id="campaign-recurrence-frequency"
            class="h-10 w-full rounded-[1.05rem] border-none bg-white/70 px-3 text-slate-700 shadow-[inset_0px_0px_7px_3px_rgba(30,41,59,0.1)] focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            bind:value={recurrenceFrequency.value}
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </Field>

        <Field>
          <FieldLabel for="campaign-recurrence-interval">Repeat every</FieldLabel>
          <Input id="campaign-recurrence-interval" type="number" min="1" max="100" field={recurrenceInterval} />
          <p class="mt-1 text-xs text-slate-500">
            {recurrenceFrequency.value === "DAILY"
              ? "day(s)"
              : recurrenceFrequency.value === "WEEKLY"
                ? "week(s)"
                : "month(s)"}
          </p>
          <FieldError error={recurrenceInterval.error} />
        </Field>

        <Field>
          <FieldLabel for="campaign-recurrence-count">Occurrences</FieldLabel>
          <Input id="campaign-recurrence-count" type="number" min="2" max="365" field={recurrenceCount} />
          <p class="mt-1 text-xs text-slate-500">Includes the first send.</p>
          <FieldError error={recurrenceCount.error} />
        </Field>
      {/if}
    </div>
  {/if}
</section>
