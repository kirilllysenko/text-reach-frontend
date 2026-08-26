import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import {
  CreateCustomFieldDocument,
  CustomFieldFormEditQueryDocument,
  UpdateCustomFieldNameDocument,
  type CustomFieldType,
} from "~/gql/graphql";
import { PATH_CUSTOM_FIELD } from "~/lib/app/paths";
import { Button, Card, Field, FieldError, FieldLabel, Input, PageTitle } from "~/components";
import { customFieldTypeLabelMap, customFieldTypeOptions } from "~/lib/feature/custom-field/custom-field-view-data";
import { defaultErrorText, networkErrorText } from "~/lib/form/errors";
import { graphqlClient } from "~/lib/graphql/client";
import { showInfo } from "~/lib/state/notifications";

export function CustomFieldFormPage(props: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const [name, setName] = createSignal("");
  const [type, setType] = createSignal<CustomFieldType>("TEXT");
  const [nameError, setNameError] = createSignal<string | null>(null);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(props.mode === "edit");
  const [submitting, setSubmitting] = createSignal(false);
  onSettled(() => {
    if (props.mode === "edit") void loadField();
  });
  async function loadField(): Promise<void> {
    setLoading(true);
    setLoadError(null);
    try {
      if (!params.id) {
        setLoadError("Custom field was not found.");
        return;
      }
      const response = await graphqlClient.query(
        CustomFieldFormEditQueryDocument,
        { id: params.id },
        { requestPolicy: "network-only" },
      );
      if (response.error || !response.data?.customField) {
        setLoadError(defaultErrorText);
        return;
      }
      setName(response.data.customField.name);
      setType(response.data.customField.fieldType);
    } catch {
      setLoadError(networkErrorText);
    } finally {
      setLoading(false);
    }
  }
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    setNameError(null);
    setFormError(null);
    const normalizedName = name().trim();
    if (!normalizedName) {
      setNameError("Required");
      return;
    }
    setSubmitting(true);
    try {
      const response =
        props.mode === "create"
          ? await graphqlClient.mutation(CreateCustomFieldDocument, {
              input: { fieldType: type(), name: normalizedName },
            })
          : await graphqlClient.mutation(UpdateCustomFieldNameDocument, { id: params.id!, name: normalizedName });
      if (response.error) {
        setFormError(defaultErrorText);
        return;
      }
      showInfo(props.mode === "create" ? "Custom field has been created" : "Custom field has been updated");
      navigate(PATH_CUSTOM_FIELD);
    } catch {
      setFormError(networkErrorText);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title={props.mode === "create" ? "Add custom field" : "Edit custom field"}>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Back
        </Button>
      </PageTitle>
      <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
        <Card variant="panel" class="w-full max-w-xl p-4 sm:p-6">
          <Show
            when={!loadError()}
            fallback={
              <div class="space-y-4 py-6 text-center">
                <FieldError error={loadError()} />
                <Button variant="secondary" onClick={() => void loadField()}>
                  Try again
                </Button>
              </div>
            }
          >
            <form onSubmit={submit} inert={submitting()}>
              <Field>
                <FieldLabel for="custom-field-name">Name</FieldLabel>
                <Input
                  id="custom-field-name"
                  value={name()}
                  onInput={(event) => setName(event.currentTarget.value)}
                  loading={loading()}
                  maxlength={100}
                  placeholder="Lead source"
                  error={nameError()}
                />
                <FieldError error={nameError()} />
              </Field>
              <Field class="mt-4">
                <FieldLabel for="custom-field-type">Type</FieldLabel>
                <select
                  id="custom-field-type"
                  class="glass-input h-10 w-full px-3"
                  value={type()}
                  disabled={props.mode === "edit" || loading()}
                  onChange={(event) => setType(event.currentTarget.value as CustomFieldType)}
                >
                  {customFieldTypeOptions.map((value) => (
                    <option value={value}>{customFieldTypeLabelMap[value]}</option>
                  ))}
                </select>
              </Field>
              <FieldError class="mt-3" error={formError()} />
              <div class="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button submit spinner={submitting()} disabled={loading() || submitting()}>
                  {props.mode === "create" ? "Add Custom Field" : "Update Custom Field"}
                </Button>
              </div>
            </form>
          </Show>
        </Card>
      </div>
    </div>
  );
}
