import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import { createStore } from "~/lib/state/store";
import { z } from "zod";
import {
  CreateUserDocument,
  UpdateUserDocument,
  UserFormEditQueryDocument,
  type CreateUserInput,
  type Role,
} from "~/gql/graphql";
import { PATH_USER } from "~/lib/app/paths";
import { Button, Card, Field, FieldError, FieldLabel, Input, PageTitle, PasswordInput } from "~/components";
import { userRoleLabelMap, userRoleOptions } from "~/lib/feature/user/user-view-data";
import { defaultErrorText, networkErrorText } from "~/lib/form/errors";
import { PasswordSchema } from "~/lib/form/validators";
import { validateFields, type FieldErrors } from "~/lib/form/validation";
import { graphqlClient } from "~/lib/graphql/client";
import { showInfo } from "~/lib/state/notifications";

interface UserFormValues {
  email: string;
  name: string;
  password: string;
  role: Role;
}

const baseValidator = z.object({
  email: z.string(),
  name: z.string().max(50, "Name must be 50 characters or fewer"),
  password: z.string(),
  role: z.enum(userRoleOptions),
});

const createValidator = baseValidator.superRefine((values, context) => {
  const email = z.email("Enter a valid email address").safeParse(values.email.trim());
  if (!email.success)
    context.addIssue({ code: "custom", message: email.error.issues[0]?.message ?? "Required", path: ["email"] });
  const password = PasswordSchema.safeParse(values.password);
  if (!password.success)
    context.addIssue({ code: "custom", message: password.error.issues[0]?.message ?? "Required", path: ["password"] });
});

export function UserFormPage(props: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const [values, setValues] = createStore<UserFormValues>({ email: "", name: "", password: "", role: "EMPLOYEE" });
  const [errors, setErrors] = createStore<FieldErrors<UserFormValues>>({});
  const [submitting, setSubmitting] = createSignal(false);
  const [loading, setLoading] = createSignal(props.mode === "edit");
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [formError, setFormError] = createSignal<string | null>(null);

  onSettled(() => {
    if (props.mode === "edit") void loadUser();
  });

  async function loadUser(): Promise<void> {
    setLoading(true);
    setLoadError(null);
    try {
      if (!params.id) {
        setLoadError("User was not found.");
        return;
      }
      const response = await graphqlClient.query(
        UserFormEditQueryDocument,
        { id: params.id },
        { requestPolicy: "network-only" },
      );
      const user = response.data?.users.edges[0]?.node;
      if (response.error || !user) {
        setLoadError(defaultErrorText);
        return;
      }
      setValues({ email: user.email, name: user.name ?? "", password: "", role: user.role });
    } catch {
      setLoadError(networkErrorText);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    setFormError(null);
    const validator = props.mode === "create" ? createValidator : baseValidator;
    const nextErrors = validateFields(validator, { ...values });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response =
        props.mode === "create"
          ? await graphqlClient.mutation(CreateUserDocument, {
              input: {
                email: values.email.trim(),
                name: values.name.trim() || null,
                password: values.password,
                role: values.role,
              } satisfies CreateUserInput,
            })
          : await graphqlClient.mutation(UpdateUserDocument, {
              input: { id: params.id!, name: values.name.trim() || null, role: values.role },
            });
      if (response.error) {
        setFormError(defaultErrorText);
        return;
      }
      showInfo(props.mode === "create" ? "User has been created" : "User has been updated");
      navigate(PATH_USER);
    } catch {
      setFormError(networkErrorText);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      class={`flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3`}
    >
      <PageTitle title={props.mode === "create" ? "Add user" : "Edit user"}>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Back
        </Button>
      </PageTitle>
      <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
        <Card variant="panel" class="w-full max-w-2xl p-4 sm:p-6">
          <Show
            when={!loadError()}
            fallback={
              <div class="space-y-4 py-6 text-center">
                <FieldError error={loadError()} />
                <Button variant="secondary" onClick={() => void loadUser()}>
                  Try again
                </Button>
              </div>
            }
          >
            <form onSubmit={submit} inert={submitting()} aria-busy={loading() ? "true" : "false"}>
              <div class="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel for="user-name">Name</FieldLabel>
                  <Input
                    id="user-name"
                    value={values.name}
                    onInput={(event) => setValues("name", event.currentTarget.value)}
                    loading={loading()}
                    maxlength={50}
                    placeholder="Avery Johnson"
                    error={errors.name}
                  />
                  <FieldError error={errors.name} />
                </Field>
                <Field>
                  <FieldLabel for="user-role">Role</FieldLabel>
                  <select
                    id="user-role"
                    class="glass-input h-10 w-full px-3 text-slate-700"
                    value={values.role}
                    disabled={loading()}
                    onChange={(event) => setValues("role", event.currentTarget.value as Role)}
                  >
                    {userRoleOptions.map((role) => (
                      <option value={role}>{userRoleLabelMap[role]}</option>
                    ))}
                  </select>
                </Field>
                <Field class="sm:col-span-2">
                  <FieldLabel for="user-email">Email</FieldLabel>
                  <Input
                    id="user-email"
                    value={values.email}
                    onInput={(event) => setValues("email", event.currentTarget.value)}
                    loading={loading()}
                    maxlength={255}
                    placeholder="avery@example.com"
                    type="email"
                    disabled={props.mode === "edit"}
                    error={errors.email}
                  />
                  <FieldError error={errors.email} />
                </Field>
                <Show when={props.mode === "create"}>
                  <Field class="sm:col-span-2">
                    <FieldLabel for="user-password">Temporary password</FieldLabel>
                    <PasswordInput
                      id="user-password"
                      value={values.password}
                      onInput={(event) => setValues("password", event.currentTarget.value)}
                      maxlength={50}
                      autocomplete="new-password"
                      placeholder="At least 8 characters"
                      error={errors.password}
                    />
                    <FieldError error={errors.password} />
                    <p class="mt-1 text-xs text-slate-500">
                      Use 8–50 characters with uppercase, lowercase, and a number.
                    </p>
                  </Field>
                </Show>
              </div>
              <FieldError class="mt-3" error={formError()} />
              <div class="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button submit spinner={submitting()} disabled={loading() || submitting()}>
                  {props.mode === "create" ? "Add User" : "Update User"}
                </Button>
              </div>
            </form>
          </Show>
        </Card>
      </div>
    </div>
  );
}
