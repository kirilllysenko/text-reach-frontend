import { describe, expect, it } from "vitest";
import { initialValues, validator } from "./form.svelte";

const groupId = "01J00000000000000000000001";
const phoneId = "01J00000000000000000000002";

describe("campaign form", () => {
  it("maps visual message parts and media to campaign input", () => {
    const result = validator.parse({
      ...initialValues,
      contactGroupIds: [groupId],
      media: [
        {
          contentType: "image/png",
          filename: "offer.png",
          id: "media-1",
          previewUrl: "blob:preview",
          sizeBytes: 428,
          url: "https://example.test/offer.png",
        },
      ],
      messageParts: [
        { id: "text-1", type: "text", value: "Hi " },
        { id: "field-1", key: "firstName", label: "First name", type: "field" },
        { id: "text-2", type: "text", value: "!" },
      ],
      name: " August offer ",
      tenantPhoneId: phoneId,
    });

    expect(result).toEqual({
      contactGroupIds: [groupId],
      media: [
        {
          contentType: "image/png",
          sizeBytes: 428,
          url: "https://example.test/offer.png",
        },
      ],
      messageTemplate: "Hi {{firstName}}!",
      name: "August offer",
      tenantPhoneId: phoneId,
    });
  });

  it("requires the base campaign fields", () => {
    const result = validator.safeParse(initialValues);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.flatten().fieldErrors).toMatchObject({
      contactGroupIds: ["Add at least one contact group"],
      messageParts: ["Required"],
      name: ["Required"],
      tenantPhoneId: ["Select a sending number"],
    });
  });
});
