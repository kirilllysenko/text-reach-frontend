import { describe, expect, it } from "vitest";
import { initialValues, validator } from "./form.svelte";

describe("contact group form helpers", () => {
  it("validates and trims the group name", () => {
    expect(validator.parse({ name: "  Newsletter subscribers  " })).toEqual({
      name: "Newsletter subscribers",
    });
    expect(validator.safeParse(initialValues).success).toBe(false);
  });
});
