import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { cache, graphql } from "$houdini";
import type { ContactWriteInput } from "$houdini/graphql/inputs";
import { PATH_CONTACT } from "$lib/app/paths";
import { createForm } from "$lib/form/form.svelte";
import { networkErrorText } from "$lib/form/errors";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import { notificationsState } from "$lib/state/notifications.svelte";
import { z } from "zod";

export type FormMode = "create" | "edit";

type ContactSubmitResponse = Record<string, never> | ErrorSubmitResponse;
type CustomFieldOption = { id: string };

type ErrorSubmitResponse = {
  data: {
    errorDescription: string;
  };
  status: 0;
};

export const contactFormValidator = z.object({
  birthday: z.string(),
  contactGroupIds: z.array(z.string()),
  customFieldValues: z.record(z.string(), z.string()),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address"),
  firstName: z.string(),
  lastName: z.string(),
  notes: z.string(),
  phoneNumber: z.string().trim().min(1, "Required"),
});

export type ContactFormValues = z.infer<typeof contactFormValidator>;
type ContactValuesWithoutCustomFields = Omit<ContactFormValues, "customFieldValues">;

export const initialValues: ContactFormValues = {
  birthday: "",
  contactGroupIds: [],
  customFieldValues: {},
  email: "",
  firstName: "",
  lastName: "",
  notes: "",
  phoneNumber: "",
};

interface ContactFormOptions {
  id?: string;
  mode: FormMode;
}

export function createContactForm(options: ContactFormOptions) {
  const createContactMutation = graphql(`
    mutation CreateContact($input: ContactWriteInput!) {
      createContact(input: $input)
    }
  `);
  const updateContactMutation = graphql(`
    mutation UpdateContact($id: Ulid!, $input: ContactWriteInput!) {
      updateContact(id: $id, input: $input)
    }
  `);

  let customFields: CustomFieldOption[] = [];
  let contactReady = $state(options.mode === "create");
  let customFieldsReady = $state(false);
  let pageLoading = $state(false);
  let pageReady = $state(false);
  let initialPayload = $state("");
  let initialContactValues: ContactValuesWithoutCustomFields = {
    birthday: initialValues.birthday,
    contactGroupIds: initialValues.contactGroupIds,
    email: initialValues.email,
    firstName: initialValues.firstName,
    lastName: initialValues.lastName,
    notes: initialValues.notes,
    phoneNumber: initialValues.phoneNumber,
  };
  let initialCustomFieldValues: Record<string, string> = {};

  const form = createForm<ContactFormValues, ContactSubmitResponse>(initialValues, contactFormValidator, submit);

  function startPageLoad(): void {
    pageLoading = true;
    pageReady = false;
    form.error = null;
  }

  function finishPageLoad(): void {
    pageLoading = false;
  }

  function setPageError(error: string): void {
    form.error = error;
    pageReady = false;
  }

  function setPageReady(): void {
    pageReady = true;
    markCleanWhenReady();
  }

  function setContact(values: ContactValuesWithoutCustomFields): void {
    initialContactValues = values;
    form.setValues({
      ...values,
      customFieldValues: form.toValues().customFieldValues,
    });
    contactReady = true;
    markCleanWhenReady();
  }

  function setCustomFields(fields: CustomFieldOption[], values: Record<string, string> = {}): void {
    customFields = fields;
    const currentValues = form.toValues();
    initialCustomFieldValues = Object.fromEntries(fields.map((field) => [field.id, values[field.id] ?? ""]));

    form.setValues({
      ...currentValues,
      customFieldValues: initialCustomFieldValues,
    });
    customFieldsReady = true;
    markCleanWhenReady();
  }

  function setCustomFieldsError(error: string): void {
    customFieldsReady = false;
    form.error = error;
  }

  function toggleContactGroup(groupId: string): void {
    form.contactGroupIds.value = form.contactGroupIds.value.includes(groupId)
      ? form.contactGroupIds.value.filter((value) => value !== groupId)
      : [...form.contactGroupIds.value, groupId];
  }

  function serialize(): string {
    return JSON.stringify(toContactWriteInput(form.toValues(), customFields));
  }

  function markCleanWhenReady(): void {
    if (!contactReady || !customFieldsReady || !pageReady) {
      return;
    }

    initialPayload = JSON.stringify(
      toContactWriteInput(
        {
          ...initialContactValues,
          customFieldValues: initialCustomFieldValues,
        },
        customFields,
      ),
    );
  }

  async function submit(values: ContactFormValues): Promise<ContactSubmitResponse> {
    try {
      const input = toContactWriteInput(values, customFields);

      if (options.mode === "create") {
        const response = await createContactMutation.mutate({ input });
        if (response.errors || !response.data?.createContact) {
          return formErrorResponse(toGraphQLErrorText(response.errors));
        }
      } else {
        if (!options.id) {
          return formErrorResponse("Contact was not found.");
        }

        const response = await updateContactMutation.mutate({ id: options.id, input });
        if (response.errors || !response.data?.updateContact) {
          return formErrorResponse(toGraphQLErrorText(response.errors));
        }
      }

      cache.markStale("ContactConnection");
      notificationsState.showInfo(options.mode === "create" ? "Contact has been created" : "Contact has been updated");
      await goto(resolve(PATH_CONTACT));
      return {};
    } catch {
      return formErrorResponse(networkErrorText);
    }
  }

  return {
    form,
    finishPageLoad,
    setContact,
    setCustomFields,
    setCustomFieldsError,
    setPageError,
    setPageReady,
    startPageLoad,
    toggleContactGroup,
    get dirty() {
      return contactReady && customFieldsReady && pageReady && serialize() !== initialPayload;
    },
    get pageLoading() {
      return pageLoading;
    },
    get pageReady() {
      return pageReady;
    },
    get ready() {
      return contactReady && customFieldsReady && pageReady;
    },
  };
}

export type ContactFormController = ReturnType<typeof createContactForm>;
export type ContactForm = ContactFormController["form"];

export function toContactWriteInput(
  values: ContactFormValues,
  customFields: readonly CustomFieldOption[] = Object.keys(values.customFieldValues).map((id) => ({ id })),
): ContactWriteInput {
  return {
    birthday: optionalText(values.birthday),
    contactGroupIds: values.contactGroupIds,
    customFields: customFields.map((field) => ({
      id: field.id,
      value: (values.customFieldValues[field.id] ?? "").trim(),
    })),
    email: optionalText(values.email),
    firstName: optionalText(values.firstName),
    lastName: optionalText(values.lastName),
    notes: optionalText(values.notes),
    phoneNumber: values.phoneNumber.trim(),
  };
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

function formErrorResponse(errorDescription: string): ErrorSubmitResponse {
  return {
    data: { errorDescription },
    status: 0,
  };
}
