import { describe, expect, it } from "vitest";
import type { TenantLifecycleData } from "$lib/state/session.svelte";
import { formatTrialEnd, tenantUpgradeStatus, trialTimeText } from "./tenant-upgrade-view-data";

function lifecycle(overrides: Partial<TenantLifecycleData> = {}): TenantLifecycleData {
  return {
    accessMode: "TRIAL",
    accountStatus: "ACTIVE",
    businessVerification: "UNVERIFIED",
    trialEndsAt: "2026-08-30T12:00:00.000Z",
    ...overrides,
  };
}

describe("tenantUpgradeStatus", () => {
  it.each([
    ["UNVERIFIED", "business-edit", "Submit your business information"],
    ["PENDING", "business", "Your business is under review"],
    ["REJECTED", "business-edit", "Update your business information"],
    ["VERIFIED", "business", "Activation is in progress"],
  ] as const)("maps %s trial verification to its next action", (businessVerification, actionPath, title) => {
    expect(tenantUpgradeStatus(lifecycle({ businessVerification }))).toMatchObject({ actionPath, title });
  });

  it("treats full access as complete regardless of trial verification state", () => {
    expect(tenantUpgradeStatus(lifecycle({ accessMode: "FULL", businessVerification: "VERIFIED" }))).toMatchObject({
      actionPath: "dashboard",
      title: "Full access is active",
      tone: "success",
    });
  });
});

describe("trialTimeText", () => {
  const now = new Date("2026-08-24T12:00:00.000Z");

  it("shows rounded-up days and hours", () => {
    expect(trialTimeText("2026-08-30T12:00:00.000Z", now)).toBe("6 days remaining");
    expect(trialTimeText("2026-08-24T13:30:00.000Z", now)).toBe("2 hours remaining");
  });

  it("handles ended and malformed trial dates", () => {
    expect(trialTimeText("2026-08-24T11:59:59.000Z", now)).toBe("Trial ended");
    expect(trialTimeText("not-a-date", now)).toBe("Trial expiration unavailable");
    expect(formatTrialEnd("not-a-date")).toBeNull();
  });
});
