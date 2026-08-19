<script lang="ts">
  import type { BusinessEntityType$options } from "$houdini/graphql/enums";
  import { Field, FieldError, FieldLabel, Input, Select, type DropdownOption } from "$lib";
  import type { BusinessProfileForm } from "./form/form.svelte";

  interface Props {
    form: BusinessProfileForm;
    loading?: boolean;
  }

  const entityTypeOptions: DropdownOption<BusinessEntityType$options>[] = [
    { id: "PRIVATE_PROFIT", value: "Private company" },
    { id: "PUBLIC_PROFIT", value: "Public company" },
    { id: "NON_PROFIT", value: "Non-profit" },
    { id: "SOLE_PROPRIETOR", value: "Sole proprietor" },
    { id: "GOVERNMENT", value: "Government" },
  ];

  let { form, loading = false }: Props = $props();
  const selectedEntityType = $derived(entityTypeOptions.find((option) => option.id === form.entityType.value));

  function selectEntityType(option: DropdownOption<BusinessEntityType$options>): void {
    form.entityType.value = option.id;
  }
</script>

<section aria-labelledby="company-information-heading">
  <h2 id="company-information-heading" class="text-lg font-semibold text-slate-800">Company</h2>
  <p class="mt-1 text-sm text-slate-500">Enter the details exactly as they appear on official records.</p>

  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    <Field>
      <FieldLabel for="business-legal-name">Legal company name</FieldLabel>
      <Input
        id="business-legal-name"
        bind:value={form.legalCompanyName.value}
        {loading}
        maxlength={255}
        autocomplete="organization"
        error={form.legalCompanyName.error}
      />
      <FieldError error={form.legalCompanyName.error} />
    </Field>

    <Field>
      <FieldLabel for="business-display-name">Display name</FieldLabel>
      <Input
        id="business-display-name"
        bind:value={form.displayName.value}
        {loading}
        maxlength={255}
        error={form.displayName.error}
      />
      <FieldError error={form.displayName.error} />
    </Field>

    <Field>
      <Select
        options={entityTypeOptions}
        value={selectedEntityType}
        label="Entity type"
        inputId="business-entity-type"
        {loading}
        error={form.entityType.error}
        onChange={selectEntityType}
      />
      <FieldError error={form.entityType.error} />
    </Field>

    <Field>
      <FieldLabel for="business-industry">Industry</FieldLabel>
      <Input
        id="business-industry"
        bind:value={form.industry.value}
        {loading}
        maxlength={100}
        placeholder="Software"
        error={form.industry.error}
      />
      <FieldError error={form.industry.error} />
    </Field>

    <Field>
      <FieldLabel for="business-registration-country">Registration country</FieldLabel>
      <Input
        id="business-registration-country"
        bind:value={form.registrationCountry.value}
        {loading}
        maxlength={2}
        autocapitalize="characters"
        placeholder="US"
        error={form.registrationCountry.error}
      />
      <FieldError error={form.registrationCountry.error} />
    </Field>
  </div>
</section>
