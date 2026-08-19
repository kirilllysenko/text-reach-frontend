import type { BusinessProfileUpdateInput } from "$houdini/graphql/inputs";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { z } from "zod";

const entityTypes = ["GOVERNMENT", "NON_PROFIT", "PRIVATE_PROFIT", "PUBLIC_PROFIT", "SOLE_PROPRIETOR"] as const;

const requiredText = (maxLength = 255) => z.string().trim().min(1, "Required").max(maxLength, "Too long");
const countryCode = z
  .string()
  .trim()
  .length(2, "Use a two-letter country code")
  .transform((value) => value.toUpperCase());
const phoneNumber = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((value) => /^\+?[1-9]\d{9,14}$/.test(value.replace(/[\s().-]/g, "")), "Enter a valid phone number")
  .transform((value) => normalizePhoneNumber(value));
const email = z.string().trim().min(1, "Required").pipe(z.email("Enter a valid email address"));
const url = z.string().trim().min(1, "Required").pipe(z.url("Enter a complete URL"));
const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || z.url().safeParse(value).success, "Enter a complete URL");

export const validator = z
  .object({
    legalCompanyName: requiredText(),
    displayName: requiredText(),
    entityType: z.enum(entityTypes),
    registrationCountry: countryCode,
    taxId: z.string().trim().max(100, "Too long"),
    taxIdIssuingCountry: z.string().trim(),
    industry: requiredText(100),
    address: z.object({
      street: requiredText(),
      city: requiredText(),
      region: requiredText(100),
      postalCode: requiredText(32),
      country: countryCode,
    }),
    website: url,
    businessPhone: phoneNumber,
    businessEmail: email,
    authorizedContact: z.object({
      firstName: requiredText(100),
      lastName: requiredText(100),
      title: requiredText(100),
      phone: phoneNumber,
      email,
    }),
    privacyPolicyUrl: optionalUrl,
    termsOfServiceUrl: optionalUrl,
  })
  .superRefine((values, context) => {
    const hasTaxId = values.taxId.length > 0;
    const hasIssuingCountry = values.taxIdIssuingCountry.length > 0;

    if (hasTaxId && !hasIssuingCountry) {
      context.addIssue({
        code: "custom",
        message: "Required when a tax ID is provided",
        path: ["taxIdIssuingCountry"],
      });
    }

    if (!hasTaxId && hasIssuingCountry) {
      context.addIssue({ code: "custom", message: "Required when an issuing country is provided", path: ["taxId"] });
    }

    if (hasIssuingCountry && values.taxIdIssuingCountry.length !== 2) {
      context.addIssue({ code: "custom", message: "Use a two-letter country code", path: ["taxIdIssuingCountry"] });
    }
  })
  .transform(
    (values): BusinessProfileUpdateInput => ({
      legalCompanyName: values.legalCompanyName,
      displayName: values.displayName,
      entityType: values.entityType,
      registrationCountry: values.registrationCountry,
      taxId: optionalText(values.taxId),
      taxIdIssuingCountry: optionalCountry(values.taxIdIssuingCountry),
      industry: values.industry,
      address: values.address,
      website: values.website,
      businessPhone: values.businessPhone,
      businessEmail: values.businessEmail,
      authorizedContact: values.authorizedContact,
      privacyPolicyUrl: optionalText(values.privacyPolicyUrl),
      termsOfServiceUrl: optionalText(values.termsOfServiceUrl),
    }),
  );

export type FormValues = z.input<typeof validator>;
export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  legalCompanyName: "",
  displayName: "",
  entityType: "PRIVATE_PROFIT",
  registrationCountry: "US",
  taxId: "",
  taxIdIssuingCountry: "",
  industry: "",
  address: {
    street: "",
    city: "",
    region: "",
    postalCode: "",
    country: "US",
  },
  website: "",
  businessPhone: "",
  businessEmail: "",
  authorizedContact: {
    firstName: "",
    lastName: "",
    title: "",
    phone: "",
    email: "",
  },
  privacyPolicyUrl: "",
  termsOfServiceUrl: "",
};

export function createBusinessProfileForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

export type BusinessProfileForm = ReturnType<typeof createBusinessProfileForm>;

function optionalText(value: string): string | null {
  return value || null;
}

function optionalCountry(value: string): string | null {
  return value ? value.toUpperCase() : null;
}

function normalizePhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  const shouldAddUsCountryCode = !value.trim().startsWith("+") && digits.length === 10;
  return `+${shouldAddUsCountryCode ? `1${digits}` : digits}`;
}
