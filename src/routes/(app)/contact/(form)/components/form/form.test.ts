import { describe, expect, it, vi } from "vitest";
import { createContactForm, type FormValues, initialValues, validator } from "./form.svelte";

describe("contact form helpers", () => {
  const contactGroupIdA = "01ARZ3NDEKTSV4RRFFQ69G5FAV";
  const contactGroupIdB = "01ARZ3NDEKTSV4RRFFQ69G5FAW";
  const customFieldId = "01ARZ3NDEKTSV4RRFFQ69G5FAX";

  it("normalizes form values into the GraphQL input", () => {
    expect(
      validator.parse({
        birthday: "1990-06-15",
        contactGroupIds: [contactGroupIdA, contactGroupIdB],
        customFields: { [customFieldId]: "  Important  " },
        email: " avery@example.com ",
        firstName: " Avery ",
        lastName: " Johnson ",
        notes: " Afternoon only ",
        phoneNumber: " +1 415 555 0127 ",
      }),
    ).toEqual({
      birthday: "1990-06-15",
      contactGroupIds: [contactGroupIdA, contactGroupIdB],
      customFields: [{ id: customFieldId, value: "Important" }],
      email: "avery@example.com",
      firstName: "Avery",
      lastName: "Johnson",
      notes: "Afternoon only",
      phoneNumber: "+1 415 555 0127",
    });
  });

  it("normalizes empty optional fields to null", () => {
    expect(
      validator.parse({
        birthday: "",
        contactGroupIds: [],
        customFields: {},
        email: " ",
        firstName: "",
        lastName: "",
        notes: "",
        phoneNumber: "5551234567",
      }),
    ).toEqual({
      birthday: null,
      contactGroupIds: [],
      customFields: [],
      email: null,
      firstName: null,
      lastName: null,
      notes: null,
      phoneNumber: "5551234567",
    });
  });

  it("validates the required phone number and optional email", () => {
    expect(validator.safeParse({ ...initialValues, phoneNumber: "5551234567" }).success).toBe(true);

    const result = validator.safeParse({
      ...initialValues,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        email: ["Enter a valid email address"],
        phoneNumber: ["Required"],
      });
    }
  });

  it("installs loaded edit values and delegates submission", async () => {
    const submit = vi.fn(async () => ({}));
    const form = createContactForm(submit);
    const values: FormValues = {
      ...initialValues,
      contactGroupIds: [contactGroupIdA],
      customFields: { [customFieldId]: "Original" },
      firstName: "Avery",
      phoneNumber: "5551234567",
    };

    form.setValues(values);
    await form.submit({ preventDefault: vi.fn() } as unknown as SubmitEvent);

    expect(form.toValues()).toEqual(values);
    expect(submit).toHaveBeenCalledWith({
      birthday: null,
      contactGroupIds: [contactGroupIdA],
      customFields: [{ id: customFieldId, value: "Original" }],
      email: null,
      firstName: "Avery",
      lastName: null,
      notes: null,
      phoneNumber: "5551234567",
    });
  });
});
