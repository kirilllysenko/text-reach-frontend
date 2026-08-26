import { useNavigate, useSearchParams } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import {
  BusinessProfileEditDocument,
  UpsertBusinessProfileDocument,
  type BusinessEntityType,
  type BusinessProfileUpdateInput,
} from "~/gql/graphql";
import { PATH_BUSINESS, PATH_PHONE_BUY, PATH_UPGRADE } from "~/lib/app/paths";
import { Button, Card, Field, FieldError, FieldLabel, Input, PageTitle } from "~/components";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { showInfo } from "~/lib/state/notifications";
import { loadTenantLifecycle } from "~/lib/state/session";

interface FormState {
  addressCity: string;
  addressCountry: string;
  addressPostalCode: string;
  addressRegion: string;
  addressStreet: string;
  authorizedEmail: string;
  authorizedFirstName: string;
  authorizedLastName: string;
  authorizedPhone: string;
  authorizedTitle: string;
  businessEmail: string;
  businessPhone: string;
  businessRegistrationType: string;
  displayName: string;
  entityType: BusinessEntityType;
  industry: string;
  legalCompanyName: string;
  privacyPolicyUrl: string;
  registrationCountry: string;
  taxId: string;
  taxIdIssuingCountry: string;
  termsOfServiceUrl: string;
  website: string;
}

const initialForm: FormState = {
  addressCity: "",
  addressCountry: "US",
  addressPostalCode: "",
  addressRegion: "",
  addressStreet: "",
  authorizedEmail: "",
  authorizedFirstName: "",
  authorizedLastName: "",
  authorizedPhone: "",
  authorizedTitle: "",
  businessEmail: "",
  businessPhone: "",
  businessRegistrationType: "",
  displayName: "",
  entityType: "PRIVATE_PROFIT",
  industry: "",
  legalCompanyName: "",
  privacyPolicyUrl: "",
  registrationCountry: "US",
  taxId: "",
  taxIdIssuingCountry: "",
  termsOfServiceUrl: "",
  website: "",
};

export default function BusinessEditPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = createStore<FormState>({ ...initialForm });
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [loading, setLoading] = createSignal(true);
  const [saving, setSaving] = createSignal(false);
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [profileExists, setProfileExists] = createSignal(false);
  const [taxLastFour, setTaxLastFour] = createSignal<string | null>(null);
  const returnPath = () =>
    params.returnTo === PATH_PHONE_BUY || params.returnTo === PATH_UPGRADE ? params.returnTo : PATH_BUSINESS;

  onSettled(() => void load());

  async function load(): Promise<void> {
    setLoading(true);
    setLoadError(null);
    setErrors({});
    try {
      const response = await graphqlClient.query(BusinessProfileEditDocument, {}, { requestPolicy: "network-only" });
      if (response.error) {
        if (graphQLErrorCode(response.error) === "NOT_FOUND") {
          setProfileExists(false);
          return;
        }
        setLoadError("There was an error.");
        return;
      }
      const profile = response.data?.businessProfile;
      if (!profile) return;
      setProfileExists(true);
      setTaxLastFour(profile.hasTaxId ? profile.taxIdLastFour : null);
      setForm({
        addressCity: profile.address.city,
        addressCountry: profile.address.country,
        addressPostalCode: profile.address.postalCode,
        addressRegion: profile.address.region,
        addressStreet: profile.address.street,
        authorizedEmail: profile.authorizedContact.email,
        authorizedFirstName: profile.authorizedContact.firstName,
        authorizedLastName: profile.authorizedContact.lastName,
        authorizedPhone: profile.authorizedContact.phone,
        authorizedTitle: profile.authorizedContact.title,
        businessEmail: profile.businessEmail,
        businessPhone: profile.businessPhone,
        businessRegistrationType: profile.businessRegistrationType ?? "",
        displayName: profile.displayName,
        entityType: profile.entityType,
        industry: profile.industry,
        legalCompanyName: profile.legalCompanyName,
        privacyPolicyUrl: profile.privacyPolicyUrl ?? "",
        registrationCountry: profile.registrationCountry,
        taxId: "",
        taxIdIssuingCountry: profile.taxIdIssuingCountry ?? "",
        termsOfServiceUrl: profile.termsOfServiceUrl ?? "",
        website: profile.website,
      });
    } catch {
      setLoadError("Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      const response = await graphqlClient.mutation(UpsertBusinessProfileDocument, { input: toInput(form) });
      if (response.error || !response.data?.upsertBusinessProfile) {
        setErrors({ form: "There was an error." });
        return;
      }
      await loadTenantLifecycle();
      showInfo(profileExists() ? "Business information has been updated." : "Business information added.");
      navigate(returnPath());
    } catch {
      setErrors({ form: "Please check your internet connection and try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title={profileExists() ? "Update business information" : "Add business information"} />
      <div class="flex min-h-0 grow justify-center overflow-y-auto pt-2 pb-18">
        <Card variant="panel" class="h-fit w-full max-w-4xl p-4 sm:p-6">
          <Show
            when={!loadError()}
            fallback={
              <div class="space-y-4 py-6 text-center">
                <FieldError error={loadError()} />
                <Button variant="secondary" onClick={() => void load()}>
                  Try again
                </Button>
              </div>
            }
          >
            <form onSubmit={(event) => void submit(event)} aria-busy={loading() || saving() ? "true" : "false"}>
              <Section title="Company" description="Enter details exactly as they appear on official records.">
                <div class="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="legal"
                    label="Legal company name"
                    field="legalCompanyName"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <FormInput
                    id="display"
                    label="Display name"
                    field="displayName"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <Field>
                    <FieldLabel for="entity-type">Entity type</FieldLabel>
                    <select
                      id="entity-type"
                      class="glass-input h-10 w-full px-3 text-sm text-slate-700"
                      value={form.entityType}
                      onChange={(event) => setForm("entityType", event.currentTarget.value as BusinessEntityType)}
                    >
                      <option value="PRIVATE_PROFIT">Private company</option>
                      <option value="PUBLIC_PROFIT">Public company</option>
                      <option value="NON_PROFIT">Non-profit</option>
                      <option value="SOLE_PROPRIETOR">Sole proprietor</option>
                      <option value="GOVERNMENT">Government</option>
                    </select>
                  </Field>
                  <FormInput
                    id="industry"
                    label="Industry"
                    field="industry"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <FormInput
                    id="registration-country"
                    label="Registration country"
                    field="registrationCountry"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    maxLength={2}
                  />
                </div>
              </Section>
              <Section title="Tax information" description="If provided, all three fields are required.">
                <Show when={taxLastFour()}>
                  {(last) => (
                    <p class="mb-3 rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-800">
                      A tax ID ending in {last()} is saved. Re-enter it to keep it.
                    </p>
                  )}
                </Show>
                <div class="grid gap-4 sm:grid-cols-3">
                  <FormInput id="tax-id" label="Tax ID" field="taxId" form={form} setForm={setForm} errors={errors()} />
                  <FormInput
                    id="registration-type"
                    label="Registration type"
                    field="businessRegistrationType"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <FormInput
                    id="tax-country"
                    label="Issuing country"
                    field="taxIdIssuingCountry"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    maxLength={2}
                  />
                </div>
              </Section>
              <Section title="Business address">
                <div class="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="street"
                    label="Street address"
                    field="addressStreet"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    wide
                  />
                  <FormInput
                    id="city"
                    label="City"
                    field="addressCity"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <FormInput
                    id="region"
                    label="State or region"
                    field="addressRegion"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <FormInput
                    id="postal"
                    label="Postal code"
                    field="addressPostalCode"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <FormInput
                    id="country"
                    label="Country"
                    field="addressCountry"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    maxLength={2}
                  />
                </div>
              </Section>
              <Section title="Business contact">
                <div class="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="business-email"
                    label="Business email"
                    field="businessEmail"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    type="email"
                  />
                  <FormInput
                    id="business-phone"
                    label="Business phone"
                    field="businessPhone"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    type="tel"
                  />
                  <FormInput
                    id="website"
                    label="Website"
                    field="website"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    type="url"
                    wide
                  />
                </div>
              </Section>
              <Section title="Authorized contact" description="The person authorized to represent the business.">
                <div class="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="first-name"
                    label="First name"
                    field="authorizedFirstName"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <FormInput
                    id="last-name"
                    label="Last name"
                    field="authorizedLastName"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <FormInput
                    id="title"
                    label="Title"
                    field="authorizedTitle"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                  />
                  <FormInput
                    id="authorized-phone"
                    label="Phone"
                    field="authorizedPhone"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    type="tel"
                  />
                  <FormInput
                    id="authorized-email"
                    label="Email"
                    field="authorizedEmail"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    type="email"
                    wide
                  />
                </div>
              </Section>
              <Section title="Messaging policies">
                <div class="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="privacy"
                    label="Privacy policy URL"
                    field="privacyPolicyUrl"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    type="url"
                    required={false}
                  />
                  <FormInput
                    id="terms"
                    label="Terms of service URL"
                    field="termsOfServiceUrl"
                    form={form}
                    setForm={setForm}
                    errors={errors()}
                    type="url"
                    required={false}
                  />
                </div>
              </Section>
              <FieldError class="mt-4" error={errors().form} />
              <div class="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => navigate(returnPath())}>
                  Cancel
                </Button>
                <Button submit spinner={saving()} disabled={loading()}>
                  {profileExists() ? "Update information" : "Save information"}
                </Button>
              </div>
            </form>
          </Show>
        </Card>
      </div>
    </div>
  );
}

function Section(props: { children: unknown; description?: string; title: string }) {
  return (
    <section class="border-b border-slate-200/70 py-5 first:pt-0">
      <h2 class="text-lg font-semibold text-slate-800">{props.title}</h2>
      <Show when={props.description}>
        <p class="mt-1 text-sm text-slate-500">{props.description}</p>
      </Show>
      <div class="mt-4">{props.children as never}</div>
    </section>
  );
}

function FormInput(props: {
  errors: Record<string, string>;
  field: keyof FormState;
  form: FormState;
  id: string;
  label: string;
  maxLength?: number;
  required?: boolean;
  setForm: ReturnType<typeof createStore<FormState>>[1];
  type?: string;
  wide?: boolean;
}) {
  return (
    <Field class={props.wide ? "sm:col-span-2" : undefined}>
      <FieldLabel for={`business-${props.id}`}>{props.label}</FieldLabel>
      <Input
        id={`business-${props.id}`}
        type={props.type ?? "text"}
        maxlength={props.maxLength ?? 255}
        value={String(props.form[props.field])}
        error={props.errors[props.field]}
        onInput={(event) => props.setForm(props.field, event.currentTarget.value as never)}
      />
      <FieldError error={props.errors[props.field]} />
    </Field>
  );
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  const required: Array<keyof FormState> = [
    "legalCompanyName",
    "displayName",
    "industry",
    "registrationCountry",
    "addressStreet",
    "addressCity",
    "addressRegion",
    "addressPostalCode",
    "addressCountry",
    "website",
    "businessPhone",
    "businessEmail",
    "authorizedFirstName",
    "authorizedLastName",
    "authorizedTitle",
    "authorizedPhone",
    "authorizedEmail",
  ];
  for (const field of required) if (!String(form[field]).trim()) errors[field] = "Required";
  for (const field of ["registrationCountry", "addressCountry"] as const)
    if (form[field].trim().length !== 2) errors[field] = "Use a two-letter country code";
  for (const field of ["businessEmail", "authorizedEmail"] as const)
    if (form[field] && !/^\S+@\S+\.\S+$/.test(form[field])) errors[field] = "Enter a valid email address";
  for (const field of ["businessPhone", "authorizedPhone"] as const)
    if (form[field] && !/^\+?[1-9]\d{9,14}$/.test(form[field].replace(/[\s().-]/g, "")))
      errors[field] = "Enter a valid phone number";
  for (const field of ["website", "privacyPolicyUrl", "termsOfServiceUrl"] as const) {
    if (!form[field]) continue;
    try {
      new URL(form[field]);
    } catch {
      errors[field] = "Enter a complete URL";
    }
  }
  const hasTax = Boolean(form.taxId || form.businessRegistrationType || form.taxIdIssuingCountry);
  if (hasTax) {
    if (!form.taxId) errors.taxId = "Required when tax information is provided";
    if (!form.businessRegistrationType) errors.businessRegistrationType = "Required when tax information is provided";
    if (form.taxIdIssuingCountry.length !== 2) errors.taxIdIssuingCountry = "Use a two-letter country code";
  }
  return errors;
}

function toInput(form: FormState): BusinessProfileUpdateInput {
  return {
    legalCompanyName: form.legalCompanyName.trim(),
    displayName: form.displayName.trim(),
    entityType: form.entityType,
    registrationCountry: form.registrationCountry.toUpperCase(),
    taxId: form.taxId.trim() || null,
    businessRegistrationType: form.businessRegistrationType.trim() || null,
    taxIdIssuingCountry: form.taxIdIssuingCountry ? form.taxIdIssuingCountry.toUpperCase() : null,
    industry: form.industry.trim(),
    address: {
      street: form.addressStreet.trim(),
      city: form.addressCity.trim(),
      region: form.addressRegion.trim(),
      postalCode: form.addressPostalCode.trim(),
      country: form.addressCountry.toUpperCase(),
    },
    website: form.website.trim(),
    businessPhone: normalizePhone(form.businessPhone),
    businessEmail: form.businessEmail.trim(),
    authorizedContact: {
      firstName: form.authorizedFirstName.trim(),
      lastName: form.authorizedLastName.trim(),
      title: form.authorizedTitle.trim(),
      phone: normalizePhone(form.authorizedPhone),
      email: form.authorizedEmail.trim(),
    },
    privacyPolicyUrl: form.privacyPolicyUrl.trim() || null,
    termsOfServiceUrl: form.termsOfServiceUrl.trim() || null,
  };
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return `+${!value.trim().startsWith("+") && digits.length === 10 ? `1${digits}` : digits}`;
}
