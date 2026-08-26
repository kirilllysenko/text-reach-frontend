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
      <Input id="business-street" field={form.address.street} {loading} maxlength={255} autocomplete="street-address" />
      <FieldError error={form.address.street.error} />
    </Field>

    <Field>
      <FieldLabel for="business-city">City</FieldLabel>
      <Input id="business-city" field={form.address.city} {loading} maxlength={255} autocomplete="address-level2" />
      <FieldError error={form.address.city.error} />
    </Field>

    <Field>
      <FieldLabel for="business-region">State or region</FieldLabel>
      <Input id="business-region" field={form.address.region} {loading} maxlength={100} autocomplete="address-level1" />
      <FieldError error={form.address.region.error} />
    </Field>

    <Field>
      <FieldLabel for="business-postal-code">Postal code</FieldLabel>
      <Input
        id="business-postal-code"
        field={form.address.postalCode}
        {loading}
        maxlength={32}
        autocomplete="postal-code"
      />
      <FieldError error={form.address.postalCode.error} />
    </Field>

    <Field>
      <FieldLabel for="business-address-country">Country</FieldLabel>
      <Input
        id="business-address-country"
        field={form.address.country}
        {loading}
        maxlength={2}
        autocomplete="country"
        autocapitalize="characters"
        placeholder="US"
      />
      <FieldError error={form.address.country.error} />
    </Field>
  </div>
</section>
