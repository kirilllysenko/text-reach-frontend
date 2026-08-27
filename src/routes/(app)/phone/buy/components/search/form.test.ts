import { describe, expect, it } from "vitest";
import { initialValues, validator } from "./form.svelte";

describe("phone search form helpers", () => {
  it("normalizes an empty search", () => {
    expect(validator.parse(initialValues)).toEqual({ number: null, tenDlcCampaignId: null });
  });

  it("keeps only phone digits and trims the campaign ID", () => {
    expect(
      validator.parse({
        phoneSearch: "(415) 555-0123",
        tenDlcCampaignId: "  campaign-id  ",
      }),
    ).toEqual({ number: "4155550123", tenDlcCampaignId: "campaign-id" });
  });
});
