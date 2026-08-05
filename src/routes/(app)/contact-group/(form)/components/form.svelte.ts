import { goto } from "$app/navigation";
import { cache, ContactGroupNameStore, CreateContactGroupStore, UpdateContactGroupStore } from "$houdini";
import { PATH_CONTACT_GROUP } from "$lib/app/paths";
import { createForm } from "$lib/form/form.svelte";
import { networkErrorText } from "$lib/form/errors";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import { notificationsState } from "$lib/state/notifications.svelte";
import { z } from "zod";

export type FormMode = "create" | "edit";

type ContactGroupSubmitResponse = SuccessSubmitResponse | ErrorSubmitResponse;

type SuccessSubmitResponse = Record<string, never>;

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
const contactGroupNameFragment = new ContactGroupNameStore();
const createContactGroupMutation = new CreateContactGroupStore();
const updateContactGroupMutation = new UpdateContactGroupStore();

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
      const result = await createContactGroupMutation.mutate({ input: { name: values.name.trim() } });

      if (result.errors || !result.data?.createContactGroup) {
        return formErrorResponse(toGraphQLErrorText(result.errors));
      }

      cache.markStale("ContactGroupConnection");
      notificationsState.showInfo("Contact group has been created");
      await goto(PATH_CONTACT_GROUP);
      return {};
    }

    if (!contactGroupId) {
      return formErrorResponse("Contact group was not found.");
    }

    const name = values.name.trim();
    const result = await updateContactGroupMutation.mutate({
      id: contactGroupId,
      input: { name },
    });

    if (result.errors || !result.data?.updateContactGroup) {
      return formErrorResponse(toGraphQLErrorText(result.errors));
    }

    cache.get("ContactGroup", { id: contactGroupId }).write({
      fragment: contactGroupNameFragment,
      data: { id: contactGroupId, name },
    });
    notificationsState.showInfo("Contact group has been updated");
    await goto(PATH_CONTACT_GROUP);
    return {};
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
