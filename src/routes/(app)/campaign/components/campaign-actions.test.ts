import { describe, expect, it } from "vitest";
import { getCampaignActions } from "./campaign-actions";

describe("getCampaignActions", () => {
  it.each(["PENDING", "SENDING"] as const)("allows pausing and cancelling a %s campaign", (status) => {
    expect(getCampaignActions(status)).toEqual(["pause", "cancel"]);
  });

  it.each(["PAUSED_BY_USER", "PAUSED_LOW_BALANCE"] as const)(
    "allows resuming and cancelling a %s campaign",
    (status) => {
      expect(getCampaignActions(status)).toEqual(["resume", "cancel"]);
    },
  );

  it.each(["CANCELLED_BY_USER", "CANCELLED_BY_TIMEOUT", "SENT"] as const)(
    "does not allow actions for a terminal %s campaign",
    (status) => {
      expect(getCampaignActions(status)).toEqual([]);
    },
  );
});
