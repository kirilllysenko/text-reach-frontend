import { goto } from "$app/navigation";
import {
  createCustomField,
  type CreateCustomFieldResponse,
  type UpdateCustomFieldNameResponse,
  updateCustomFieldName,
} from "$lib/api/custom-field/custom-field";
import type { CustomFieldType, Ulid } from "$lib/api/index.schemas";
import { PATH_CUSTOM_FIELD } from "$lib/app/paths";
import { customFieldTypeLabelMap, customFieldTypeOptions } from "$lib/feature/custom-field/custom-field-view-data";
import { createForm } from "$lib/form/form.svelte";
import { networkErrorText } from "$lib/form/errors";
import { notificationsState } from "$lib/state/notifications.svelte";
import { z } from "zod";

export type FormMode = "create" | "edit";

export interface TypeOption {
  id: CustomFieldType;
  value: string;
}

type CustomFieldSubmitResponse = CreateCustomFieldResponse | UpdateCustomFieldNameResponse | ErrorSubmitResponse;

type ErrorSubmitResponse = {
  data: {
    errorDescription: string;
  };
  status: 0;
};

export const typeOptions = customFieldTypeOptions.map((type) => ({
  id: type,
  value: customFieldTypeLabelMap[type],
})) satisfies TypeOption[];

export const validator = z.object({
  name: z.string().trim().min(1, "Required"),
  type: z.custom<CustomFieldType>((value) => customFieldTypeOptions.includes(value as CustomFieldType)),
});

export type FormValues = z.infer<typeof validator>;

export const initialValues: FormValues = {
  name: "",
  type: typeOptions[0].id,
};

let formMode: FormMode = "create";
let customFieldId: string | undefined;

export const form = createForm<FormValues, CustomFieldSubmitResponse>(initialValues, validator, submit);

export function configureCustomFieldForm(options: { id?: string; mode: FormMode }): void {
  formMode = options.mode;
  customFieldId = options.id;
  form.setValues(initialValues);
}

export function getTypeOption(type: CustomFieldType): TypeOption {
  return typeOptions.find((option) => option.id === type) ?? typeOptions[0];
}

export function setCustomFieldFormValues(values: FormValues): void {
  form.setValues(values);
}

async function submit(values: FormValues): Promise<CustomFieldSubmitResponse> {
  try {
    if (formMode === "create") {
      const response = await createCustomField(
        {
          name: values.name.trim(),
          type: values.type,
        },
        { credentials: "include" },
      );

      if (response.status === 200) {
        notificationsState.showInfo("Custom field has been created");
        await goto(PATH_CUSTOM_FIELD);
      }

      return response;
    }

    if (!customFieldId) {
      return formErrorResponse("Custom field was not found.");
    }

    const response = await updateCustomFieldName(
      customFieldId as Ulid,
      { name: values.name.trim() },
      { credentials: "include" },
    );

    if (response.status === 200) {
      notificationsState.showInfo("Custom field has been updated");
      await goto(PATH_CUSTOM_FIELD);
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
