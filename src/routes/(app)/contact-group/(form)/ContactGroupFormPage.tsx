import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import {
  ContactGroupFormEditQueryDocument,
  CreateContactGroupDocument,
  UpdateContactGroupDocument,
} from "~/gql/graphql";
import { PATH_CONTACT_GROUP } from "~/lib/app/paths";
import { Button, Card, Field, FieldError, FieldLabel, Input, PageTitle } from "~/components";
import { defaultErrorText, networkErrorText } from "~/lib/form/errors";
import { graphqlClient } from "~/lib/graphql/client";
import { showInfo } from "~/lib/state/notifications";

export function ContactGroupFormPage(props: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const [name, setName] = createSignal("");
  const [nameError, setNameError] = createSignal<string | null>(null);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(props.mode === "edit");
  const [submitting, setSubmitting] = createSignal(false);

  onSettled(() => {
    if (props.mode === "edit") void loadGroup();
  });
  async function loadGroup(): Promise<void> {
    setLoading(true);
    setLoadError(null);
    try {
      if (!params.id) {
        setLoadError("Contact group was not found.");
        return;
      }
      const response = await graphqlClient.query(
        ContactGroupFormEditQueryDocument,
        { id: params.id },
        { requestPolicy: "network-only" },
      );
      if (response.error || !response.data?.contactGroup) {
        setLoadError(defaultErrorText);
        return;
      }
      setName(response.data.contactGroup.name);
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
          ? await graphqlClient.mutation(CreateContactGroupDocument, { input: { name: normalizedName } })
          : await graphqlClient.mutation(UpdateContactGroupDocument, {
              id: params.id!,
              input: { name: normalizedName },
            });
      if (response.error) {
        setFormError(defaultErrorText);
        return;
      }
      showInfo(props.mode === "create" ? "Contact group has been created" : "Contact group has been updated");
      navigate(PATH_CONTACT_GROUP);
    } catch {
      setFormError(networkErrorText);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title={props.mode === "create" ? "Add contact group" : "Edit contact group"}>
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
                <Button variant="secondary" onClick={() => void loadGroup()}>
                  Try again
                </Button>
              </div>
            }
          >
            <form onSubmit={submit} inert={submitting()}>
              <Field>
                <FieldLabel for="contact-group-name">Name</FieldLabel>
                <Input
                  id="contact-group-name"
                  value={name()}
                  onInput={(event) => setName(event.currentTarget.value)}
                  loading={loading()}
                  maxlength={100}
                  placeholder="Newsletter subscribers"
                  error={nameError()}
                />
                <FieldError error={nameError()} />
              </Field>
              <FieldError class="mt-3" error={formError()} />
              <div class="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button submit spinner={submitting()} disabled={loading() || submitting()}>
                  {props.mode === "create" ? "Add Contact Group" : "Update Contact Group"}
                </Button>
              </div>
            </form>
          </Show>
        </Card>
      </div>
    </div>
  );
}
