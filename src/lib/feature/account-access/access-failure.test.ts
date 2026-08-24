import { describe, expect, it } from "vitest";
import {
  PATH_ACCOUNT_CLOSED,
  PATH_ACCOUNT_SUSPENDED,
  PATH_ACCOUNT_UNAVAILABLE,
  PATH_TRIAL_EXPIRED,
} from "$lib/app/paths";
import { accessFailurePath } from "./access-failure";

describe("accessFailurePath", () => {
  it.each(["TRIAL_EXPIRED", "TENANT_TRIAL_EXPIRED"])("maps %s to the expired-trial page", (code) => {
    expect(accessFailurePath(code)).toBe(PATH_TRIAL_EXPIRED);
  });

  it.each(["ACCOUNT_SUSPENDED", "TENANT_SUSPENDED"])("maps %s to the suspended-account page", (code) => {
    expect(accessFailurePath(code)).toBe(PATH_ACCOUNT_SUSPENDED);
  });

  it.each(["ACCOUNT_CLOSED", "TENANT_CLOSED"])("maps %s to the closed-account page", (code) => {
    expect(accessFailurePath(code)).toBe(PATH_ACCOUNT_CLOSED);
  });

  it("uses the generic page when an existing session no longer resolves to a user", () => {
    expect(accessFailurePath("SESSION_INVALID_USER")).toBe(PATH_ACCOUNT_UNAVAILABLE);
  });

  it("does not intercept unrelated errors", () => {
    expect(accessFailurePath("INVALID_VALUE")).toBeNull();
    expect(accessFailurePath()).toBeNull();
  });
});
