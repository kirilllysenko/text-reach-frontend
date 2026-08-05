import { goto } from "$app/navigation";
import { CreateCustomFieldStore, UpdateCustomFieldNameStore, cache } from "$houdini";
import { PATH_CUSTOM_FIELD } from "$lib/app/paths";
import {
  customFieldTypeLabelMap,
  customFieldTypeOptions,
  type CustomFieldType,
} from "$lib/feature/custom-field/custom-field-view-data";
import { createForm } from "$lib/form/form.svelte";
import { networkErrorText } from "$lib/form/errors";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import { notificationsState } from "$lib/state/notifications.svelte";
import { z } from "zod";

export type FormMode = "create" | "edit";

export interface TypeOption {
  id: CustomFieldType;
  value: string;
}

type CustomFieldSubmitResponse = Record<string, never> | ErrorSubmitResponse;

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
const createCustomFieldMutation = new CreateCustomFieldStore();
const updateCustomFieldNameMutation = new UpdateCustomFieldNameStore();

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
      const response = await createCustomFieldMutation.mutate({
        input: {
          name: values.name.trim(),
          fieldType: values.type,
        },
      });

      if (!response.errors && response.data?.createCustomField) {
        cache.markStale("CustomField");
        notificationsState.showInfo("Custom field has been created");
        await goto(PATH_CUSTOM_FIELD);
        return {};
      }

      return formErrorResponse(toGraphQLErrorText(response.errors));
    }

    if (!customFieldId) {
      return formErrorResponse("Custom field was not found.");
    }

    const response = await updateCustomFieldNameMutation.mutate({ id: customFieldId, name: values.name.trim() });

    if (!response.errors && response.data?.updateCustomFieldName) {
      cache.markStale("CustomField");
      notificationsState.showInfo("Custom field has been updated");
      await goto(PATH_CUSTOM_FIELD);
      return {};
    }

    return formErrorResponse(toGraphQLErrorText(response.errors));
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
