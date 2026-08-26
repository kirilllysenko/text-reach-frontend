import { describe, expect, it, vi } from "vitest";
import { createUserForm, initialValues } from "./form.svelte";

describe("user form helpers", () => {
  it("validates create-only credentials", async () => {
    const submit = vi.fn(async () => ({}));
    const form = createUserForm("create", submit);

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

  it("normalizes create values before submission", async () => {
    const submit = vi.fn(async () => ({}));
    const form = createUserForm("create", submit);

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

  it("does not require credentials while editing", async () => {
    const submit = vi.fn(async () => ({}));
    const form = createUserForm("edit", submit);

    await form.submit({ preventDefault: vi.fn() } as unknown as SubmitEvent);

    expect(submit).toHaveBeenCalledOnce();
  });
});
