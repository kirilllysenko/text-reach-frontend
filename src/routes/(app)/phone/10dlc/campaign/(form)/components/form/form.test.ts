import { describe, expect, it } from "vitest";
import { initialValues, validator } from "./form.svelte";

describe("10DLC campaign form", () => {
  it("builds a registration input with uploaded consent evidence", () => {
    const result = validator.parse({
      ...initialValues,
      description: "Customer notifications",
      documentUrl: "https://files.example.com/consent.pdf",
      messageFlow: "Customers opt in on the account page.",
      sampleMessage1: "Your order is ready. Reply STOP to opt out.",
      sampleMessage2: "Your order shipped. Reply STOP to opt out.",
      termsAndConditions: true,
    });

    expect(result.messageFlow).toContain("https://files.example.com/consent.pdf");
    expect(result.optOutKeywords).toEqual(["STOP", "END", "CANCEL", "UNSUBSCRIBE"]);
    expect(result.sampleMessages).toHaveLength(2);
  });

  it("requires two samples, consent evidence, and terms acceptance", () => {
    expect(validator.safeParse(initialValues).success).toBe(false);
  });
});
