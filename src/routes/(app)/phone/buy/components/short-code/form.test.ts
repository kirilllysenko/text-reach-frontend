import { describe, expect, it } from "vitest";
import { initialValues, validator } from "./form.svelte";

const validValues = {
  ...initialValues,
  description: "Account alerts and customer support updates",
  estimatedMonthlyVolume: "25000",
  messageFlow: "Customers opt in on the account settings page and confirm their mobile number.",
  optInEvidenceUrls: "https://example.com/opt-in\nhttps://example.com/consent.pdf",
  sampleMessage1: "Your account update is ready. Reply STOP to opt out.",
  sampleMessage2: "We received your support request. Reply HELP for help.",
  useCase: "Customer care and account notifications",
};

describe("short code application form", () => {
  it("builds a random short code application input", () => {
    const result = validator.parse(validValues);

    expect(result.estimatedMonthlyVolume).toBe(25_000);
    expect(result.requestedShortCode).toBeNull();
    expect(result.optInEvidenceUrls).toEqual(["https://example.com/opt-in", "https://example.com/consent.pdf"]);
    expect(result.optOutKeywords).toEqual(["STOP", "END", "CANCEL", "UNSUBSCRIBE"]);
    expect(result.sampleMessages).toHaveLength(2);
  });

  it("accepts the numeric value emitted by the number input", () => {
    const result = validator.parse({
      ...validValues,
      estimatedMonthlyVolume: 25_000,
    });

    expect(result.estimatedMonthlyVolume).toBe(25_000);
  });

  it("requires five or six digits for a vanity short code", () => {
    const invalidResult = validator.safeParse({
      ...validValues,
      requestedShortCode: "1234",
      shortCodeType: "VANITY",
    });
    const validResult = validator.parse({
      ...validValues,
      requestedShortCode: "54321",
      shortCodeType: "VANITY",
    });

    expect(invalidResult.success).toBe(false);
    expect(validResult.requestedShortCode).toBe("54321");
  });

  it("rejects invalid consent evidence and non-positive volume", () => {
    const result = validator.safeParse({
      ...validValues,
      estimatedMonthlyVolume: "0",
      optInEvidenceUrls: "not-a-url",
    });

    expect(result.success).toBe(false);
  });
});
