import { describe, expect, it, vi } from "vitest";
import { contactFormValidator, createContactForm, toContactWriteInput } from "./form.svelte";

vi.mock("$houdini", () => ({
  cache: { markStale: vi.fn() },
  graphql: vi.fn(() => ({ mutate: vi.fn() })),
}));

describe("contact form helpers", () => {
  it("normalizes form values into the GraphQL input", () => {
    expect(
      toContactWriteInput({
        birthday: "1990-06-15",
        contactGroupIds: ["group-a", "group-b"],
        customFieldValues: { "field-a": "  Important  " },
        email: " avery@example.com ",
        firstName: " Avery ",
        lastName: " Johnson ",
        notes: " Afternoon only ",
        phoneNumber: " +1 415 555 0127 ",
      }),
    ).toEqual({
      birthday: "1990-06-15",
      contactGroupIds: ["group-a", "group-b"],
      customFields: [{ id: "field-a", value: "Important" }],
      email: "avery@example.com",
      firstName: "Avery",
      lastName: "Johnson",
      notes: "Afternoon only",
      phoneNumber: "+1 415 555 0127",
    });
  });

  it("normalizes empty optional fields to null", () => {
    expect(
      toContactWriteInput({
        birthday: "",
        contactGroupIds: [],
        customFieldValues: {},
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
    const values = {
      birthday: "",
      contactGroupIds: [],
      customFieldValues: {},
      email: "not-an-email",
      firstName: "",
      lastName: "",
      notes: "",
      phoneNumber: "",
    };

    const result = contactFormValidator.safeParse(values);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        email: ["Enter a valid email address"],
        phoneNumber: ["Required"],
      });
    }
  });

  it("keeps edits dirty when custom fields finish loading later", () => {
    const contactForm = createContactForm({ id: "contact-a", mode: "edit" });

    contactForm.startPageLoad();
    contactForm.setContact({
      birthday: "",
      contactGroupIds: [],
      email: "",
      firstName: "Avery",
      lastName: "",
      notes: "",
      phoneNumber: "5551234567",
    });
    contactForm.setPageReady();
    contactForm.finishPageLoad();

    contactForm.form.firstName.value = "Avery Updated";
    contactForm.setCustomFields([{ id: "field-a" }], { "field-a": "Original" });

    expect(contactForm.ready).toBe(true);
    expect(contactForm.dirty).toBe(true);
  });
});
