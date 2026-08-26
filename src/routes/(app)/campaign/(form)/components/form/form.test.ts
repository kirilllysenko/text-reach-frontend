import { describe, expect, it } from "vitest";
import { buildRecurrenceRule, initialValues, validator } from "./form.svelte";

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

  it("maps a one-time local schedule to an instant", () => {
    const result = validator.parse({
      ...validValues(),
      scheduledAt: "2099-01-01T09:30",
      scheduleType: "once",
    });

    expect(result.scheduledAt).toBe(new Date("2099-01-01T09:30").toISOString());
    expect(result.recurrenceRule).toBeUndefined();
  });

  it("maps a recurring schedule to an RFC 5545 rule", () => {
    const rule = buildRecurrenceRule(
      {
        recurrenceCount: "6",
        recurrenceFrequency: "WEEKLY",
        recurrenceInterval: "2",
        scheduledAt: "2099-01-01T09:30",
      },
      "America/Los_Angeles",
    );

    expect(rule).toBe("DTSTART;TZID=America/Los_Angeles:20990101T093000\nRRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=6");
  });

  it("validates active schedule controls", () => {
    const result = validator.safeParse({
      ...validValues(),
      recurrenceCount: "1",
      recurrenceInterval: "0",
      scheduleType: "recurring",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.flatten().fieldErrors).toMatchObject({
      recurrenceCount: ["Occurrences must be between 2 and 365"],
      recurrenceInterval: ["Repeat every must be between 1 and 100"],
      scheduledAt: ["Choose a date and time"],
    });
  });
});

function validValues() {
  return {
    ...initialValues,
    contactGroupIds: [groupId],
    messageParts: [{ id: "text-1", type: "text" as const, value: "Hello" }],
    name: "Campaign",
    tenantPhoneId: phoneId,
  };
}
