import { goto } from "$app/navigation";
import {
  createContact,
  type CreateContactResponse,
  type UpdateContactResponse,
  updateContact,
} from "$lib/api/contact/contact";
import type { ContactCreateDto, CustomFieldDto, Ulid } from "$lib/api/index.schemas";
import { PATH_CONTACT } from "$lib/app/paths";
import { createForm } from "$lib/form/form.svelte";
import { networkErrorText } from "$lib/form/errors";
import { notificationsState } from "$lib/state/notifications.svelte";
import { z } from "zod";

export type FormMode = "create" | "edit";

type ContactSubmitResponse = CreateContactResponse | UpdateContactResponse | ErrorSubmitResponse;
type CustomFieldOption = Pick<CustomFieldDto, "id">;

type ErrorSubmitResponse = {
  data: {
    errorDescription: string;
  };
  status: 0;
};

export const validator = z.object({
  birthday: z.string(),
  contactGroupIds: z.array(z.string()),
  customFieldValues: z.record(z.string(), z.string()),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  notes: z.string(),
  phoneNumber: z.string().trim().min(1, "Required"),
});

export type FormValues = z.infer<typeof validator>;

export const initialValues: FormValues = {
  birthday: "",
  contactGroupIds: [],
  customFieldValues: {},
  email: "",
  firstName: "",
  lastName: "",
  notes: "",
  phoneNumber: "",
};

let formMode: FormMode = "create";
let contactId: string | undefined;
let customFields: CustomFieldOption[] = [];

export const form = createForm<FormValues, ContactSubmitResponse>(initialValues, validator, submit);

export function configureContactForm(options: { id?: string; mode: FormMode }): void {
  formMode = options.mode;
  contactId = options.id;
  customFields = [];
  form.setValues(initialValues);
}

export function setContactCustomFields(fields: CustomFieldOption[]): void {
  customFields = fields;
  const values = form.toValues();

  form.setValues({
    ...values,
    customFieldValues: normalizeCustomFieldValues(values.customFieldValues),
  });
}

export function setContactFormValues(values: FormValues): void {
  form.setValues({
    ...values,
    customFieldValues: normalizeCustomFieldValues(values.customFieldValues),
  });
}

export function serializeContactPayload(): string {
  return JSON.stringify(toContactPayload());
}

export function toggleContactGroup(groupId: string): void {
  form.contactGroupIds.value = form.contactGroupIds.value.includes(groupId)
    ? form.contactGroupIds.value.filter((value) => value !== groupId)
    : [...form.contactGroupIds.value, groupId];
}

function normalizeCustomFieldValues(values: Record<string, string>): Record<string, string> {
  if (customFields.length === 0) {
    return values;
  }

  return Object.fromEntries(customFields.map((field) => [field.id, values[field.id] ?? ""]));
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

function toContactPayload(values = form.toValues()): ContactCreateDto {
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

async function submit(values: FormValues): Promise<ContactSubmitResponse> {
  try {
    if (formMode === "create") {
      const response = await createContact(toContactPayload(values), { credentials: "include" });

      if (response.status === 200) {
        notificationsState.showInfo("Contact has been created");
        await goto(PATH_CONTACT);
      }

      return response;
    }

    if (!contactId) {
      return formErrorResponse("Contact was not found.");
    }

    const response = await updateContact(contactId as Ulid, toContactPayload(values), { credentials: "include" });

    if (response.status === 200) {
      notificationsState.showInfo("Contact has been updated");
      await goto(PATH_CONTACT);
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
