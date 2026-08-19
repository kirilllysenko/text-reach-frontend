<script lang="ts">
  import { Field, FieldError, FieldLabel, Input } from "$lib";
  import type { BusinessProfileForm } from "./form/form.svelte";

  interface Props {
    form: BusinessProfileForm;
    loading?: boolean;
  }

  let { form, loading = false }: Props = $props();
</script>

<section class="border-t border-slate-200/70 pt-5" aria-labelledby="business-address-heading">
  <h2 id="business-address-heading" class="text-lg font-semibold text-slate-800">Business address</h2>

  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    <Field class="sm:col-span-2">
      <FieldLabel for="business-street">Street address</FieldLabel>
      <Input
        id="business-street"
        bind:value={form.address.street.value}
        {loading}
        maxlength={255}
        autocomplete="street-address"
        error={form.address.street.error}
      />
      <FieldError error={form.address.street.error} />
    </Field>

    <Field>
      <FieldLabel for="business-city">City</FieldLabel>
      <Input
        id="business-city"
        bind:value={form.address.city.value}
        {loading}
        maxlength={255}
        autocomplete="address-level2"
        error={form.address.city.error}
      />
      <FieldError error={form.address.city.error} />
    </Field>

    <Field>
      <FieldLabel for="business-region">State or region</FieldLabel>
      <Input
        id="business-region"
        bind:value={form.address.region.value}
        {loading}
        maxlength={100}
        autocomplete="address-level1"
        error={form.address.region.error}
      />
      <FieldError error={form.address.region.error} />
    </Field>

    <Field>
      <FieldLabel for="business-postal-code">Postal code</FieldLabel>
      <Input
        id="business-postal-code"
        bind:value={form.address.postalCode.value}
        {loading}
        maxlength={32}
        autocomplete="postal-code"
        error={form.address.postalCode.error}
      />
      <FieldError error={form.address.postalCode.error} />
    </Field>

    <Field>
      <FieldLabel for="business-address-country">Country</FieldLabel>
      <Input
        id="business-address-country"
        bind:value={form.address.country.value}
        {loading}
        maxlength={2}
        autocomplete="country"
        autocapitalize="characters"
        placeholder="US"
        error={form.address.country.error}
      />
      <FieldError error={form.address.country.error} />
    </Field>
  </div>
</section>
