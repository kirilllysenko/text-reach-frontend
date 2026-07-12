import { goto } from "$app/navigation";
import {
  createContactGroup,
  type CreateContactGroupResponse,
  type UpdateContactGroupResponse,
  updateContactGroup,
} from "$lib/api/contact-group/contact-group";
import type { Ulid } from "$lib/api/index.schemas";
import { PATH_CONTACT_GROUP } from "$lib/app/paths";
import { createForm } from "$lib/form/form.svelte";
import { networkErrorText } from "$lib/form/errors";
import { notificationsState } from "$lib/state/notifications.svelte";
import { z } from "zod";

export type FormMode = "create" | "edit";

type ContactGroupSubmitResponse = CreateContactGroupResponse | UpdateContactGroupResponse | ErrorSubmitResponse;

type ErrorSubmitResponse = {
  data: {
    errorDescription: string;
  };
  status: 0;
};

export const validator = z.object({
  name: z.string().trim().min(1, "Required"),
});

export type FormValues = z.infer<typeof validator>;

export const initialValues: FormValues = {
  name: "",
};

let formMode: FormMode = "create";
let contactGroupId: string | undefined;

export const form = createForm<FormValues, ContactGroupSubmitResponse>(initialValues, validator, submit);

export function configureContactGroupForm(options: { id?: string; mode: FormMode }): void {
  formMode = options.mode;
  contactGroupId = options.id;
  form.setValues(initialValues);
}

export function setContactGroupFormValues(values: FormValues): void {
  form.setValues(values);
}

async function submit(values: FormValues): Promise<ContactGroupSubmitResponse> {
  try {
    if (formMode === "create") {
      const response = await createContactGroup({ name: values.name.trim() }, { credentials: "include" });

      if (response.status === 200) {
        notificationsState.showInfo("Contact group has been created");
        await goto(PATH_CONTACT_GROUP);
      }

      return response;
    }

    if (!contactGroupId) {
      return formErrorResponse("Contact group was not found.");
    }

    const response = await updateContactGroup(
      contactGroupId as Ulid,
      { name: values.name.trim() },
      { credentials: "include" },
    );

    if (response.status === 200) {
      notificationsState.showInfo("Contact group has been updated");
      await goto(PATH_CONTACT_GROUP);
    }

    return response;
  } catch {
    return formErrorResponse(networkErrorText);
  }
}

function formErrorResponse(errorDescription: string): ErrorSubmitResponse {
  return {
    data: {
      errorDescription,
    },
    status: 0,
  };
}
