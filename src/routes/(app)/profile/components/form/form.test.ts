import { describe, expect, it } from "vitest";
import { initialPasswordValues, profileNameValidator, profilePasswordValidator } from "./form.svelte";

describe("profile form helpers", () => {
  it("trims a profile name and converts an empty name to null", () => {
    expect(profileNameValidator.parse({ name: "  Taylor  " })).toEqual({ name: "Taylor" });
    expect(profileNameValidator.parse({ name: "   " })).toEqual({ name: null });
  });

  it("validates both password fields", () => {
    expect(profilePasswordValidator.safeParse(initialPasswordValues).success).toBe(false);
    expect(
      profilePasswordValidator.safeParse({
        oldPassword: "Valid-password1",
        newPassword: "Another-valid-password2",
      }).success,
    ).toBe(true);
  });
});
