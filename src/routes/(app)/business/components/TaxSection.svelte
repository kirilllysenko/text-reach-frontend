<script lang="ts">
  import { Field, FieldError, FieldLabel, Input } from "$lib";
  import type { BusinessProfileForm } from "./form/form.svelte";

  interface Props {
    existingTaxIdLastFour?: string | null;
    form: BusinessProfileForm;
    loading?: boolean;
  }

  let { existingTaxIdLastFour = null, form, loading = false }: Props = $props();
</script>

<section class="border-t border-slate-200/70 pt-5" aria-labelledby="tax-information-heading">
  <h2 id="tax-information-heading" class="text-lg font-semibold text-slate-800">Tax information</h2>
  <p class="mt-1 text-sm text-slate-500">
    Optional unless required for messaging registration. If provided, all three fields are required.
  </p>

  {#if existingTaxIdLastFour}
    <div class="mt-3 rounded-xl border border-amber-200 bg-amber-100 px-3 py-2 text-sm text-amber-800">
      A tax ID ending in {existingTaxIdLastFour} is saved. Re-enter it to keep it on this full-profile update, or leave all
      tax fields blank to remove it.
    </div>
  {/if}

  <div class="mt-4 grid gap-4 sm:grid-cols-3">
    <Field>
      <FieldLabel for="business-tax-id">Tax ID</FieldLabel>
      <Input
        id="business-tax-id"
        bind:value={form.taxId.value}
        {loading}
        maxlength={100}
        autocomplete="off"
        placeholder={existingTaxIdLastFour ? `Ending in ${existingTaxIdLastFour}` : "12-3456789"}
        error={form.taxId.error}
      />
      <FieldError error={form.taxId.error} />
    </Field>

    <Field>
      <FieldLabel for="business-registration-type">Business registration type</FieldLabel>
      <Input
        id="business-registration-type"
        bind:value={form.businessRegistrationType.value}
        {loading}
        maxlength={100}
        autocomplete="off"
        placeholder="EIN"
        error={form.businessRegistrationType.error}
      />
      <FieldError error={form.businessRegistrationType.error} />
    </Field>

    <Field>
      <FieldLabel for="business-tax-country">Tax ID issuing country</FieldLabel>
      <Input
        id="business-tax-country"
        bind:value={form.taxIdIssuingCountry.value}
        {loading}
        maxlength={2}
        autocapitalize="characters"
        placeholder="US"
        error={form.taxIdIssuingCountry.error}
      />
      <FieldError error={form.taxIdIssuingCountry.error} />
    </Field>
  </div>
</section>
