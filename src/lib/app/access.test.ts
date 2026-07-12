import { describe, expect, it } from "vitest";
import { AccessGroup } from "$lib/api/index.schemas";
import { resolvePageAccess } from "./access";

describe("page access policy", () => {
  it("uses write access for form routes before their read prefixes", () => {
    expect(resolvePageAccess("/contact/add")).toBe(AccessGroup.CONTACT_WRITE);
    expect(resolvePageAccess("/contact/contact-id/edit")).toBe(AccessGroup.CONTACT_WRITE);
    expect(resolvePageAccess("/custom-field/field-id/edit")).toBe(AccessGroup.CUSTOM_FIELDS_WRITE);
    expect(resolvePageAccess("/payment/top-up")).toBe(AccessGroup.BILLING_WRITE);
  });

  it("maps readable pages and nested messages to their backend access groups", () => {
    expect(resolvePageAccess("/contact")).toBe(AccessGroup.CONTACT_READ);
    expect(resolvePageAccess("/smart-group")).toBe(AccessGroup.CONTACT_READ);
    expect(resolvePageAccess("/campaign/campaign-id/messages")).toBe(AccessGroup.MESSAGE_READ);
    expect(resolvePageAccess("/payment/transaction")).toBe(AccessGroup.BILLING_READ);
  });

  it("leaves unrestricted pages without an access requirement", () => {
    expect(resolvePageAccess("/dashboard")).toBeUndefined();
    expect(resolvePageAccess("/profile")).toBeUndefined();
  });
});
