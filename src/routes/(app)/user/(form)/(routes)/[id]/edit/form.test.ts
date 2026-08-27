import { describe, expect, it, vi } from "vitest";
import { createEditUserForm } from "./form.svelte";

describe("edit user form", () => {
  it("submits only editable normalized values", async () => {
    const submit = vi.fn(async () => ({}));
    const form = createEditUserForm(submit);

    form.setValues({
      email: "avery@example.com",
      name: "   ",
      role: "MANAGER",
    });
    await form.submit({ preventDefault: vi.fn() } as unknown as SubmitEvent);

    expect(submit).toHaveBeenCalledWith({
      name: null,
      role: "MANAGER",
    });
  });
});
