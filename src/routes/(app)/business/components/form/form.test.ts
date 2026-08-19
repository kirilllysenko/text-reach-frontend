import { describe, expect, it } from "vitest";
import { validator } from "./form.svelte";

const validValues = {
  legalCompanyName: " Example Holdings LLC ",
  displayName: " Example ",
  entityType: "PRIVATE_PROFIT" as const,
  registrationCountry: "us",
  taxId: "12-3456789",
  taxIdIssuingCountry: "us",
  industry: " Software ",
  address: {
    street: " 1 Market Street ",
    city: " San Francisco ",
    region: " CA ",
    postalCode: " 94105 ",
    country: "us",
  },
  website: "https://example.com",
  businessPhone: "(415) 555-0100",
  businessEmail: "business@example.com",
  authorizedContact: {
    firstName: " Taylor ",
    lastName: " Owner ",
    title: " CEO ",
    phone: "+1 415 555 0101",
    email: "taylor@example.com",
  },
  privacyPolicyUrl: "",
  termsOfServiceUrl: "https://example.com/terms",
};

describe("business profile form", () => {
  it("normalizes form values for the GraphQL input", () => {
    const result = validator.parse(validValues);

    expect(result).toEqual({
      legalCompanyName: "Example Holdings LLC",
      displayName: "Example",
      entityType: "PRIVATE_PROFIT",
      registrationCountry: "US",
      taxId: "12-3456789",
      taxIdIssuingCountry: "US",
      industry: "Software",
      address: {
        street: "1 Market Street",
        city: "San Francisco",
        region: "CA",
        postalCode: "94105",
        country: "US",
      },
      website: "https://example.com",
      businessPhone: "+14155550100",
      businessEmail: "business@example.com",
      authorizedContact: {
        firstName: "Taylor",
        lastName: "Owner",
        title: "CEO",
        phone: "+14155550101",
        email: "taylor@example.com",
      },
      privacyPolicyUrl: null,
      termsOfServiceUrl: "https://example.com/terms",
    });
  });

  it("requires tax ID and issuing country together", () => {
    const result = validator.safeParse({ ...validValues, taxIdIssuingCountry: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ["taxIdIssuingCountry"], message: "Required when a tax ID is provided" }),
      );
    }
  });

  it("preserves an explicitly entered international country code", () => {
    const result = validator.parse({ ...validValues, businessPhone: "+33 1 23 45 67 89" });

    expect(result.businessPhone).toBe("+33123456789");
  });
});
