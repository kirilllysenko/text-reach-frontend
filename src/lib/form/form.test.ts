import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createForm } from "./form.svelte";

describe("FormController", () => {
  it("sets the general error returned by the submit handler", async () => {
    const form = createForm({ name: "Avery" }, z.object({ name: z.string() }), async () => ({
      error: "Could not save the form.",
    }));

    await form.submit({ preventDefault: vi.fn() } as unknown as SubmitEvent);

    expect(form.error).toBe("Could not save the form.");
  });

  it("clears the general error when submission succeeds", async () => {
    const form = createForm({ name: "Avery" }, z.object({ name: z.string() }), async () => ({}));
    form.error = "Previous error";

    await form.submit({ preventDefault: vi.fn() } as unknown as SubmitEvent);

    expect(form.error).toBeNull();
  });
});
