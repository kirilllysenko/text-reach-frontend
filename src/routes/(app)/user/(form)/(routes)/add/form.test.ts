import { describe, expect, it, vi } from "vitest";
import { createAddUserForm, initialValues } from "./form.svelte";

describe("add user form", () => {
  it("validates credentials", async () => {
    const submit = vi.fn(async () => ({}));
    const form = createAddUserForm(submit);

    form.setValues({
      ...initialValues,
      email: "not-an-email",
      password: "short",
    });
    await form.submit({ preventDefault: vi.fn() } as unknown as SubmitEvent);

    expect(submit).not.toHaveBeenCalled();
    expect(form.email.error).toBe("Enter a valid email address");
    expect(form.password.error).not.toBeNull();
  });

  it("normalizes values before submission", async () => {
    const submit = vi.fn(async () => ({}));
    const form = createAddUserForm(submit);

    form.setValues({
      email: "  avery@example.com  ",
      name: "   ",
      password: "Password1",
      role: "MANAGER",
    });
    await form.submit({ preventDefault: vi.fn() } as unknown as SubmitEvent);

    expect(submit).toHaveBeenCalledWith({
      email: "avery@example.com",
      name: null,
      password: "Password1",
      role: "MANAGER",
    });
  });
});
