import { useNavigate } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import {
  CreateTenDlcBrandDocument,
  TenDlcBrandBusinessProfileDocument,
  type TenDlcBrandBusinessProfileQuery,
} from "~/gql/graphql";
import { PATH_BUSINESS_EDIT, PATH_TEN_DLC } from "~/lib/app/paths";
import { Alert, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle } from "~/components";
import { graphqlClient } from "~/lib/graphql/client";
import { showInfo } from "~/lib/state/notifications";
type Business = TenDlcBrandBusinessProfileQuery["businessProfile"];
export default function TenDlcBrandPage() {
  const navigate = useNavigate();
  const [business, setBusiness] = createSignal<Business | null>(null);
  const [name, setName] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [nameError, setNameError] = createSignal<string | null>(null);
  onSettled(() => void load());
  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const response = await graphqlClient.query(
        TenDlcBrandBusinessProfileDocument,
        {},
        { requestPolicy: "network-only" },
      );
      if (response.error || !response.data?.businessProfile) throw new Error();
      setBusiness(response.data.businessProfile);
      setName(response.data.businessProfile.displayName);
    } catch {
      setError("Add your complete business information before registering a 10DLC brand.");
    } finally {
      setLoading(false);
    }
  }
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!name().trim()) {
      setNameError("Required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await graphqlClient.mutation(CreateTenDlcBrandDocument, { input: { name: name().trim() } });
      if (response.error || !response.data?.createTenDlcBrand) throw new Error();
      showInfo("10DLC brand registration submitted.");
      navigate(PATH_TEN_DLC);
    } catch {
      setError("Could not submit 10DLC brand registration.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Register 10DLC brand">
        <a href={PATH_TEN_DLC} class="text-sm font-medium text-sky-700">
          10DLC
        </a>
      </PageTitle>
      <div class="flex min-h-0 grow justify-center overflow-y-auto pt-2 pb-18">
        <Card variant="panel" class="h-fit w-full max-w-3xl p-4 sm:p-6">
          <Show
            when={!error() || business()}
            fallback={
              <div class="space-y-4 py-6 text-center">
                <Alert type="warning" layout="inline">
                  {error()}
                </Alert>
                <a
                  href={`${PATH_BUSINESS_EDIT}?returnTo=${encodeURIComponent(PATH_TEN_DLC)}`}
                  class="text-sm font-medium text-sky-700"
                >
                  Add business information
                </a>
              </div>
            }
          >
            <form onSubmit={(event) => void submit(event)} aria-busy={loading() || saving() ? "true" : "false"}>
              <h2 class="text-lg font-semibold">Business identity</h2>
              <p class="mt-1 text-sm text-slate-500">Carrier registration uses your saved legal and contact details.</p>
              <Show when={business()}>
                {(value) => (
                  <dl class="mt-4 grid gap-3 rounded-2xl bg-white/70 p-4 sm:grid-cols-2">
                    <Detail label="Legal name" value={value().legalCompanyName} />
                    <Detail label="Entity type" value={value().entityType.replaceAll("_", " ")} />
                    <Detail label="Email" value={value().businessEmail} />
                    <Detail label="Website" value={value().website} />
                  </dl>
                )}
              </Show>
              <Field class="mt-5">
                <FieldLabel for="ten-dlc-brand-name">Customer-facing brand name</FieldLabel>
                <Input
                  id="ten-dlc-brand-name"
                  value={name()}
                  maxlength={255}
                  loading={loading()}
                  error={nameError()}
                  onInput={(event) => {
                    setName(event.currentTarget.value);
                    setNameError(null);
                  }}
                />
                <FieldError error={nameError()} />
              </Field>
              <FieldError class="mt-4" error={business() ? error() : null} />
              <div class="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => navigate(PATH_TEN_DLC)}>
                  Cancel
                </Button>
                <Button submit spinner={saving()} disabled={loading()}>
                  Submit brand
                </Button>
              </div>
            </form>
          </Show>
        </Card>
      </div>
    </div>
  );
}
function Detail(props: { label: string; value: string }) {
  return (
    <div>
      <dt class="text-xs text-slate-500">{props.label}</dt>
      <dd class="font-medium text-slate-700">{props.value}</dd>
    </div>
  );
}
