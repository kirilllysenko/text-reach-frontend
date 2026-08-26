import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, For, onSettled, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import { z } from "zod";
import {
  ContactFormByIdDocument,
  ContactGroupComboboxQueryDocument,
  CreateContactDocument,
  CustomFieldsQueryDocument,
  UpdateContactDocument,
  type ContactWriteInput,
  type CustomFieldsQueryQuery,
} from "~/gql/graphql";
import { PATH_CONTACT } from "~/lib/app/paths";
import { Button, Card, Field, FieldError, FieldLabel, Input, PageTitle, TextArea } from "~/components";
import { defaultErrorText, networkErrorText } from "~/lib/form/errors";
import { validateFields, type FieldErrors } from "~/lib/form/validation";
import { graphqlClient } from "~/lib/graphql/client";
import { showInfo } from "~/lib/state/notifications";

interface ContactFormValues {
  birthday: string;
  contactGroupIds: string[];
  customFields: Record<string, string>;
  email: string;
  firstName: string;
  lastName: string;
  messagingConsent: boolean;
  notes: string;
  phoneNumber: string;
}

type CustomField = CustomFieldsQueryQuery["customFields"][number];

const baseValidator = z.object({
  birthday: z.string(),
  contactGroupIds: z.array(z.string()),
  customFields: z.record(z.string(), z.string()),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address"),
  firstName: z.string(),
  lastName: z.string(),
  messagingConsent: z.boolean(),
  notes: z.string(),
  phoneNumber: z.string().trim().min(1, "Required"),
});

export function ContactFormPage(props: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const [values, setValues] = createStore<ContactFormValues>({
    birthday: "",
    contactGroupIds: [],
    customFields: {},
    email: "",
    firstName: "",
    lastName: "",
    messagingConsent: false,
    notes: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = createStore<FieldErrors<ContactFormValues>>({});
  const [customFields, setCustomFields] = createSignal<CustomField[]>([]);
  const [contactGroups, setContactGroups] = createSignal<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = createSignal(true);
  const [submitting, setSubmitting] = createSignal(false);
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [formError, setFormError] = createSignal<string | null>(null);

  onSettled(() => void loadForm());

  async function loadForm(): Promise<void> {
    setLoading(true);
    setLoadError(null);
    try {
      const [fieldsResponse, groupsResponse, contactResponse] = await Promise.all([
        graphqlClient.query(CustomFieldsQueryDocument, {}, { requestPolicy: "network-only" }),
        graphqlClient.query(
          ContactGroupComboboxQueryDocument,
          { first: 300, sortBy: [{ name: { direction: "ASC" } }] },
          { requestPolicy: "network-only" },
        ),
        props.mode === "edit" && params.id
          ? graphqlClient.query(ContactFormByIdDocument, { id: params.id }, { requestPolicy: "network-only" })
          : Promise.resolve(null),
      ]);
      if (!fieldsResponse.error && fieldsResponse.data) {
        setCustomFields(fieldsResponse.data.customFields);
        setValues("customFields", Object.fromEntries(fieldsResponse.data.customFields.map((field) => [field.id, ""])));
      }
      if (!groupsResponse.error && groupsResponse.data) {
        setContactGroups(groupsResponse.data.contactGroups.edges.map(({ node }) => node));
      }
      if (props.mode === "edit") {
        const contact = contactResponse?.data?.contact;
        if (contactResponse?.error || !contact) {
          setLoadError(defaultErrorText);
          return;
        }
        setValues({
          birthday: contact.birthday ?? "",
          contactGroupIds: contact.contactGroups.map((group) => group.id),
          customFields: Object.fromEntries(contact.customFields.map((field) => [field.customField.id, field.value])),
          email: contact.email ?? "",
          firstName: contact.firstName ?? "",
          lastName: contact.lastName ?? "",
          messagingConsent: true,
          notes: contact.notes ?? "",
          phoneNumber: contact.phoneNumber,
        });
      }
    } catch {
      setLoadError(networkErrorText);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validateFields(baseValidator, { ...values });
    if (props.mode === "create" && !values.messagingConsent) {
      nextErrors.messagingConsent = "Confirm that this contact gave consent to receive messages";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    try {
      const input = toContactInput(values);
      const response =
        props.mode === "create"
          ? await graphqlClient.mutation(CreateContactDocument, { input })
          : await graphqlClient.mutation(UpdateContactDocument, { id: params.id!, input });
      if (response.error) {
        setFormError(defaultErrorText);
        return;
      }
      showInfo(props.mode === "create" ? "Contact has been created" : "Contact has been updated");
      navigate(PATH_CONTACT);
    } catch {
      setFormError(networkErrorText);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title={props.mode === "create" ? "Add contact" : "Edit contact"}>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Back
        </Button>
      </PageTitle>
      <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
        <Card variant="panel" class="w-full max-w-3xl p-4 sm:p-6">
          <Show
            when={!loadError()}
            fallback={
              <div class="space-y-4 py-6 text-center">
                <FieldError error={loadError()} />
                <Button variant="secondary" onClick={() => void loadForm()}>
                  Try again
                </Button>
              </div>
            }
          >
            <form onSubmit={submit} inert={submitting()} aria-busy={loading() ? "true" : "false"}>
              <div class="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel for="contact-first-name">First name</FieldLabel>
                  <Input
                    id="contact-first-name"
                    value={values.firstName}
                    onInput={(event) => setValues("firstName", event.currentTarget.value)}
                    loading={loading()}
                    maxlength={100}
                    placeholder="Avery"
                  />
                </Field>
                <Field>
                  <FieldLabel for="contact-last-name">Last name</FieldLabel>
                  <Input
                    id="contact-last-name"
                    value={values.lastName}
                    onInput={(event) => setValues("lastName", event.currentTarget.value)}
                    loading={loading()}
                    maxlength={100}
                    placeholder="Johnson"
                  />
                </Field>
                <Field>
                  <FieldLabel for="contact-phone-number">Phone</FieldLabel>
                  <Input
                    id="contact-phone-number"
                    value={values.phoneNumber}
                    onInput={(event) => setValues("phoneNumber", event.currentTarget.value)}
                    loading={loading()}
                    maxlength={40}
                    placeholder="+1 415 555 0127"
                    error={errors.phoneNumber}
                  />
                  <FieldError error={errors.phoneNumber} />
                </Field>
                <Field>
                  <FieldLabel for="contact-email">Email</FieldLabel>
                  <Input
                    id="contact-email"
                    value={values.email}
                    onInput={(event) => setValues("email", event.currentTarget.value)}
                    loading={loading()}
                    maxlength={255}
                    placeholder="avery@example.com"
                    type="email"
                    error={errors.email}
                  />
                  <FieldError error={errors.email} />
                </Field>
                <Field>
                  <FieldLabel for="contact-birthday">Birthday</FieldLabel>
                  <Input
                    id="contact-birthday"
                    value={values.birthday}
                    onInput={(event) => setValues("birthday", event.currentTarget.value)}
                    loading={loading()}
                    type="date"
                  />
                </Field>
                <Field>
                  <FieldLabel for="contact-groups">Groups</FieldLabel>
                  <select
                    id="contact-groups"
                    class="glass-input min-h-24 w-full px-3 py-2 text-slate-700"
                    multiple
                    value={values.contactGroupIds}
                    disabled={loading()}
                    onChange={(event) =>
                      setValues(
                        "contactGroupIds",
                        [...event.currentTarget.selectedOptions].map((option) => option.value),
                      )
                    }
                  >
                    <For each={contactGroups()}>{(group) => <option value={group.id}>{group.name}</option>}</For>
                  </select>
                </Field>
              </div>
              <Field class="mt-4">
                <FieldLabel for="contact-notes">Notes</FieldLabel>
                <TextArea
                  id="contact-notes"
                  value={values.notes}
                  onInput={(event) => setValues("notes", event.currentTarget.value)}
                  loading={loading()}
                  maxlength={1000}
                  rows={4}
                  placeholder="Prefers afternoon texts"
                />
              </Field>
              <Show when={customFields().length > 0}>
                <section class="mt-5">
                  <h2 class="mb-2 text-sm font-medium text-slate-700">Custom fields</h2>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <For each={customFields()}>
                      {(field) => (
                        <Field>
                          <FieldLabel for={`contact-custom-field-${field.id}`}>{field.name}</FieldLabel>
                          <Input
                            id={`contact-custom-field-${field.id}`}
                            value={values.customFields[field.id] ?? ""}
                            onInput={(event) => setValues("customFields", field.id, event.currentTarget.value)}
                            loading={loading()}
                            type={field.fieldType.toLowerCase()}
                          />
                        </Field>
                      )}
                    </For>
                  </div>
                </section>
              </Show>
              <Show when={props.mode === "create"}>
                <Field class="mt-5">
                  <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white/70 p-4">
                    <input
                      type="checkbox"
                      checked={values.messagingConsent}
                      onChange={(event) => setValues("messagingConsent", event.currentTarget.checked)}
                      class="mt-0.5 size-5"
                    />
                    <span>
                      <span class="block text-sm font-semibold text-slate-800">Messaging consent</span>
                      <span class="mt-1 block text-sm text-slate-600">
                        I confirm this contact gave consent to receive text messages from this organization.
                      </span>
                    </span>
                  </label>
                  <FieldError error={errors.messagingConsent} />
                </Field>
              </Show>
              <FieldError class="mt-3" error={formError()} />
              <div class="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button submit spinner={submitting()} disabled={loading() || submitting()}>
                  {props.mode === "create" ? "Add Contact" : "Update Contact"}
                </Button>
              </div>
            </form>
          </Show>
        </Card>
      </div>
    </div>
  );
}

function toContactInput(values: ContactFormValues): ContactWriteInput {
  const optionalText = (value: string) => value.trim() || null;
  return {
    birthday: optionalText(values.birthday),
    contactGroupIds: values.contactGroupIds,
    customFields: Object.entries(values.customFields).map(([id, value]) => ({ id, value: value.trim() })),
    email: optionalText(values.email),
    firstName: optionalText(values.firstName),
    lastName: optionalText(values.lastName),
    notes: optionalText(values.notes),
    phoneNumber: values.phoneNumber.trim(),
  };
}
