<script lang="ts">
  import { Field, FieldError, FieldLabel, Input } from "$lib";
  import type { BusinessProfileForm } from "./form/form.svelte";

  interface Props {
    form: BusinessProfileForm;
    loading?: boolean;
  }

  let { form, loading = false }: Props = $props();
</script>

<section class="border-t border-slate-200/70 pt-5" aria-labelledby="messaging-policy-heading">
  <h2 id="messaging-policy-heading" class="text-lg font-semibold text-slate-800">Messaging policies</h2>
  <p class="mt-1 text-sm text-slate-500">
    Public links help carriers verify how recipients are informed and protected.
  </p>

  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    <Field>
      <FieldLabel for="business-privacy-policy">Privacy policy URL</FieldLabel>
      <Input
        id="business-privacy-policy"
        type="url"
        field={form.privacyPolicyUrl}
        {loading}
        maxlength={2048}
        placeholder="https://example.com/privacy"
      />
      <FieldError error={form.privacyPolicyUrl.error} />
    </Field>

    <Field>
      <FieldLabel for="business-terms">Terms of service URL</FieldLabel>
      <Input
        id="business-terms"
        type="url"
        field={form.termsOfServiceUrl}
        {loading}
        maxlength={2048}
        placeholder="https://example.com/terms"
      />
      <FieldError error={form.termsOfServiceUrl.error} />
    </Field>
  </div>
</section>
