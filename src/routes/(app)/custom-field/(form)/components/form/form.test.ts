import { describe, expect, it } from "vitest";
import { initialValues, validator } from "./form.svelte";

describe("custom field form helpers", () => {
  it("maps UI values to the GraphQL input", () => {
    expect(validator.parse({ name: "  Lead source  ", type: "TEXT" })).toEqual({
      fieldType: "TEXT",
      name: "Lead source",
    });
    expect(validator.safeParse(initialValues).success).toBe(false);
  });
});
