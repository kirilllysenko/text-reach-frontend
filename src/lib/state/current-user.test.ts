import { describe, expect, it } from "vitest";
import { AccessGroup, type ProfileDto } from "$lib/api/index.schemas";
import { hasAccess, hasAnyAccess } from "./current-user-access";

const user = {
  accessGroups: [AccessGroup.CONTACT_READ, AccessGroup.CAMPAIGN_READ],
  email: "employee@example.test",
} satisfies ProfileDto;

describe("current user access checks", () => {
  it("allows a granted access group", () => {
    expect(hasAccess(user, AccessGroup.CONTACT_READ)).toBe(true);
  });

  it("denies missing access groups and missing users", () => {
    expect(hasAccess(user, AccessGroup.CONTACT_WRITE)).toBe(false);
    expect(hasAccess(null, AccessGroup.CONTACT_READ)).toBe(false);
  });

  it("allows when any required access group is granted", () => {
    expect(hasAnyAccess(user, [AccessGroup.BILLING_READ, AccessGroup.CAMPAIGN_READ])).toBe(true);
    expect(hasAnyAccess(user, [AccessGroup.BILLING_READ, AccessGroup.USER_READ])).toBe(false);
  });
});
