import { describe, expect, it } from "vitest";
import { initialValues, selectedTopUpAmountMicros, validator } from "./form.svelte";

describe("top-up form helpers", () => {
  it("uses the selected preset when the custom amount is empty", () => {
    expect(validator.parse(initialValues)).toEqual({ amountUsdMicros: 10_000_000 });
  });

  it("uses the custom amount when provided", () => {
    expect(selectedTopUpAmountMicros({ customAmount: "25.50", selectedPreset: 10 })).toBe(25_500_000);
  });

  it("rejects invalid custom amounts", () => {
    expect(validator.safeParse({ customAmount: "nope", selectedPreset: 10 }).success).toBe(false);
    expect(validator.safeParse({ customAmount: "0", selectedPreset: 10 }).success).toBe(false);
  });
});
