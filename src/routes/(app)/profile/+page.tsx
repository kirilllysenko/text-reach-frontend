import { createEffect, createSignal } from "solid-js";
import { ChangePasswordDocument, ChangeProfileNameDocument } from "~/gql/graphql";
import { Button, Field, FieldError, FieldLabel, Input, PageTitle, PasswordInput } from "~/components";
import { defaultErrorText, networkErrorText, toErrorText } from "~/lib/form/errors";
import { PasswordSchema } from "~/lib/form/validators";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { showInfo } from "~/lib/state/notifications";
import { applyProfile, session } from "~/lib/state/session";

function ProfileNameForm() {
  const [name, setName] = createSignal("");
  const [initialName, setInitialName] = createSignal("");
  const [initialized, setInitialized] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  createEffect(
    () => ({ initialized: initialized(), profile: session.profile }),
    ({ initialized, profile }) => {
      if (initialized || !profile) return;
      const currentName = profile.name ?? "";
      setName(currentName);
      setInitialName(currentName);
      setInitialized(true);
    },
  );

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const response = await graphqlClient.mutation(ChangeProfileNameDocument, { name: name().trim() || null });
      if (response.error || !response.data?.changeProfileName || !session.profile) {
        setError(toErrorText(graphQLErrorCode(response.error)));
        return;
      }
      const nextName = name().trim();
      applyProfile({ ...session.profile, name: nextName });
      setName(nextName);
      setInitialName(nextName);
      showInfo("Your name has been changed");
    } catch {
      setError(networkErrorText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 class="pb-3 text-slate-800">Change your name</h2>
      <form class="sm:max-w-md" onSubmit={submit}>
        <Field>
          <FieldLabel for="profile-name">Name</FieldLabel>
          <Input
            id="profile-name"
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
            maxlength={50}
            placeholder="Your name"
          />
        </Field>
        <FieldError class="mt-3" error={error()} />
        <Button class="mt-4 w-30" submit spinner={saving()} disabled={name() === initialName()}>
          Save
        </Button>
      </form>
    </section>
  );
}

function ProfilePasswordForm() {
  const [oldPassword, setOldPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [oldPasswordError, setOldPasswordError] = createSignal<string | null>(null);
  const [newPasswordError, setNewPasswordError] = createSignal<string | null>(null);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [saving, setSaving] = createSignal(false);

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    setOldPasswordError(null);
    setNewPasswordError(null);
    setFormError(null);
    const oldResult = PasswordSchema.safeParse(oldPassword());
    const newResult = PasswordSchema.safeParse(newPassword());
    if (!oldResult.success) setOldPasswordError(oldResult.error.issues[0]?.message ?? "Required");
    if (!newResult.success) setNewPasswordError(newResult.error.issues[0]?.message ?? "Required");
    if (!oldResult.success || !newResult.success) return;

    setSaving(true);
    try {
      const response = await graphqlClient.mutation(ChangePasswordDocument, {
        input: { oldPassword: oldPassword(), newPassword: newPassword() },
      });
      if (response.error || !response.data?.changePassword) {
        setFormError(toErrorText(graphQLErrorCode(response.error)) || defaultErrorText);
        return;
      }
      setOldPassword("");
      setNewPassword("");
      showInfo("Your password has been changed");
    } catch {
      setFormError(networkErrorText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 class="pb-3 text-slate-800">Change password</h2>
      <form class="sm:max-w-md" onSubmit={submit}>
        <Field>
          <FieldLabel for="old-password">Current password</FieldLabel>
          <PasswordInput
            id="old-password"
            value={oldPassword()}
            onInput={(event) => setOldPassword(event.currentTarget.value)}
            error={oldPasswordError()}
          />
          <FieldError error={oldPasswordError()} />
        </Field>
        <Field class="mt-4">
          <FieldLabel for="new-password">New password</FieldLabel>
          <PasswordInput
            id="new-password"
            value={newPassword()}
            onInput={(event) => setNewPassword(event.currentTarget.value)}
            error={newPasswordError()}
          />
          <FieldError error={newPasswordError()} />
        </Field>
        <FieldError class="mt-3" error={formError()} />
        <Button class="mt-4 w-30" submit spinner={saving()} disabled={!oldPassword() && !newPassword()}>
          Save
        </Button>
      </form>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <div class="flex h-full min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:p-3">
      <PageTitle title="Profile" />
      <div class="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:p-6">
        <ProfileNameForm />
        <div class="pt-10">
          <ProfilePasswordForm />
        </div>
      </div>
    </div>
  );
}
