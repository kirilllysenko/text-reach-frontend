# Form Page Guide

Use this guide for add and edit pages backed by `src/lib/form/form.svelte.ts`. It describes the preferred structure,
ownership boundaries, loading behavior, validation, submission, and component decomposition.

## Responsibilities

Keep each concern in one place:

| Concern                                                                                                   | Owner                               |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Page title, `Card`, load state, load errors, queries, mutations, cache updates, notifications, navigation | `+page.svelte`                      |
| Repeated add/edit form markup and action buttons                                                          | Route-local form component          |
| Independent sections with their own query or section-local state                                          | Route-local section component       |
| Input shape, initial values, validation, normalization, API input transformation                          | `components/form/form.svelte.ts`    |
| Field state, validation execution, submit state, and error assignment                                     | `src/lib/form/form.svelte.ts`       |
| Reusable inputs, fields, buttons, cards, and loading visuals                                              | `src/lib/components` and global CSS |

The route owns application side effects. Do not put Houdini mutations, navigation, cache writes, notifications, or
route IDs in `form.svelte.ts`. Do not export one mutable form instance shared by add and edit pages; export a factory
and create the form in each page.

## Folder Structure

A feature with add and edit pages should normally look like this:

```text
feature/(form)/
├── (routes)/
│   ├── add/+page.svelte
│   └── [id]/edit/+page.svelte
└── components/
    ├── FeatureForm.svelte
    ├── FeatureFormSection.svelte
    └── form/form.svelte.ts
```

- `FeatureForm.svelte` is appropriate when add and edit render substantially the same fields.
- Keep a small form directly in each page only when extracting it would add indirection without removing meaningful
  duplication.
- A section such as custom fields should be separate when it owns a query, effects, dynamic field shape, or distinct
  loading and error states.
- Keep page-only components in the route group. Promote them to `src/lib` only when another route group genuinely
  reuses them. Never import from one route directory into another.

## Page Layout And Card

Form routes use the normal app page shell, with the page title outside one panel card:

```svelte
<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Add item">
    <BackButton />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-3xl p-4 sm:p-6">
      <!-- Form or load error -->
    </Card>
  </div>
</div>
```

Rules:

- Use `Card variant="panel"`; the default card variant is for authentication pages.
- The card is the form surface, not the entire page shell.
- Keep `PageTitle`, back navigation, and the scroll container outside the card.
- Give the card a deliberate maximum width based on the form. `max-w-3xl` is the current default for a two-column
  form.
- Do not nest another card around each section. Use spacing, headings, `Field`, and responsive grids inside the card.
- Keep the vertical scroll container explicit so the same layout works in the browser and a Capacitor webview.

## Form Markup

The shared form component or page markup should follow this shape:

```svelte
<form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={loading}>
  <div class="grid gap-4 sm:grid-cols-2">
    <Field>
      <FieldLabel for="item-name">Name</FieldLabel>
      <Input id="item-name" bind:value={form.name.value} {loading} error={form.name.error} maxlength={100} />
      <FieldError error={form.name.error} />
    </Field>
  </div>

  <FieldError class="mt-3" error={form.error} />

  <div class="mt-5 flex justify-end gap-2">
    <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
    <Button submit spinner={form.loading} disabled={loading || form.loading}>Save</Button>
  </div>
</form>
```

- Every control has a stable, page-specific `id`, and every `FieldLabel` points to it.
- Bind controls to `form.<field>.value`.
- Pass `form.<field>.error` both to the input's error state and its `FieldError` when the primitive supports an error
  appearance.
- Put the general `form.error` after the fields and before the actions.
- Use `form.loading` only for submission state. It drives `inert`, the submit spinner, and submit disabling.
- Preserve native attributes such as `type`, `maxlength`, and `autocomplete`; Zod remains the source of validation
  truth, but native attributes improve the editing experience.
- Do not create page-specific input wrappers merely to forward props. Use the shared primitive directly or create a
  semantic section component.

## Edit-Page Loading

Edit pages have two different asynchronous states:

- `loading`: fetching the initial values.
- `form.loading`: submitting an already initialized form.

Do not combine them. The edit route owns `loading` and `loadError`:

```ts
let loading = $state(true);
let loadError = $state<string | null>(null);

onMount(() => {
  void loadForm();
});

async function loadForm(): Promise<void> {
  loading = true;
  loadError = null;
  form.clearErrors();

  try {
    const response = await editQuery.fetch({ variables: { id } });

    if (response.errors || !response.data?.item) {
      loadError = "There was an error.";
      return;
    }

    form.setValues(toFormValues(response.data.item));
  } catch {
    loadError = networkErrorText;
  } finally {
    loading = false;
  }
}
```

Loading presentation follows these rules:

- Keep the page title, card, labels, sections, and actions in their final positions.
- Pass `loading` to `Input`, `TextArea`, comboboxes, and route-local sections. Shared primitives apply the global
  animated skeleton and prevent editing while loading.
- For content with no rendered control yet, use the global `skeleton-loading` utility on a stable placeholder. Do not
  copy gradient or animation classes into pages.
- Set `aria-busy={loading}` on the form or section.
- Disable the primary action while the initial values are loading. Keep navigation available when practical.
- Do not render blank inputs that look editable, a centered “Loading…” message, or a full-page skeleton.
- A section that starts its own query combines both states, for example
  `const sectionLoading = $derived(loading || $query.fetching)`.

When the initial load fails, replace the form inside the card with a concise error and retry action:

```svelte
{#if loadError}
  <div class="space-y-4 py-6 text-center">
    <FieldError error={loadError} />
    <Button variant="secondary" onclick={loadForm}>Try again</Button>
  </div>
{:else}
  <FeatureForm {form} {loading} submitLabel="Update item" />
{/if}
```

Do not show stale or partially loaded form values after an initial-load failure. A child section with an independent
query may instead show an inline error and retry control inside that section.

## Writing `form.svelte.ts`

A feature form module contains four things:

1. A Zod validator.
2. The UI input type and parsed submit type.
3. Complete initial values.
4. A factory around `createForm`.

```ts
import type { ItemWriteInput } from "$houdini/graphql/inputs";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { z } from "zod";

export const validator = z
  .object({
    email: z
      .string()
      .trim()
      .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address"),
    name: z.string().trim().min(1, "Required"),
  })
  .transform(
    (values): ItemWriteInput => ({
      email: optionalText(values.email),
      name: values.name,
    }),
  );

export type FormValues = z.input<typeof validator>;
export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  email: "",
  name: "",
};

export function createItemForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}
```

### Validation And Transformation Rules

- `FormValues` describes what controls edit. Use strings for text and date controls, including optional values, so
  binding remains simple.
- `SubmitValues` describes what the page submit handler receives. Transform empty optional text to `null`, trim text,
  and map dynamic records to API arrays in the validator transformation.
- Use `z.input<typeof validator>` and `z.output<typeof validator>` whenever the validator transforms data. Do not use
  one inferred type for both sides if their shapes differ.
- Keep `initialValues` complete and in the UI shape. Edit pages call `form.setValues()` after mapping query data back to
  that same shape.
- Write validation messages for users: short, specific, and actionable. Use `"Required"` for a missing required field.
- Put cross-field validation in the Zod schema. Keep transformations out of page markup and submit handlers.
- Export the validator and types when focused tests, section components, or edit-value mapping need them.

### Dynamic Object Fields

Dynamic records such as custom fields are represented by a nested `FormShape`. When a component query determines the
available keys, synchronize the shape with `setFormShapeValue` only after the field definitions exist. Preserve values
for IDs that remain present and initialize new IDs with their empty UI value. Guard the effect so it writes only when
the key set changes; an unguarded effect can repeatedly replace reactive state.

## Add And Edit Pages

Both pages create their own form instance:

```ts
const mutation = new CreateItemStore();
const form = createItemForm(submit);
```

The add page renders immediately from `initialValues`. The edit page additionally owns the query and maps query data to
`FormValues` before calling `form.setValues()`.

If add and edit share markup, the route-local form component should receive semantic props rather than a long list of
forwarded primitive props:

```ts
interface Props {
  form: ReturnType<typeof createItemForm>;
  loading?: boolean;
  submitLabel: string;
}
```

Keep `Card`, load-error switching, and data operations in the page. Let the shared component own the `<form>`, fields,
sections, general error, and actions. This keeps add and edit visually identical without coupling their data flows.

## Submission Contract And Errors

Every submit handler returns `Promise<FormSubmitResult>`, where the result is `{ error?: string }`:

```ts
async function submit(input: SubmitValues): Promise<FormSubmitResult> {
  try {
    const response = await mutation.mutate({ input });

    if (response.errors) {
      return { error: "There was an error." };
    }

    cache.markStale("ItemConnection");
    notificationsState.showInfo("Item has been created");
    await goto(resolve(PATH_ITEM));
    return {};
  } catch {
    return { error: networkErrorText };
  }
}
```

- Return `{}` after a successful mutation, cache update, notification, and navigation.
- Return `{ error }` for a recoverable submission failure. `FormController` assigns it directly to `form.error`.
- Use `networkErrorText` when the request throws.
- Never display GraphQL/backend error messages directly. Return `"There was an error."` for GraphQL errors unless a
  stable error code has an intentionally written user-facing mapping, as described in `docs/README.md`.
- Field validation errors come from Zod before the submit handler runs. Do not manually duplicate them in the page.
- Keep load errors in `loadError`, submission errors in `form.error`, and field errors in
  `form.<field>.error`. These states have different placement and retry behavior.

## GraphQL Placement

- Put the edit query beside the edit page when the page owns it.
- Put a section query beside the section component when that component owns fetching, retrying, and rendering it.
- Keep one operation per `.graphql` file and use the generated Houdini store.
- These are client-side flows. Do not add server form actions, `+page.server.ts`, or runtime SSR dependencies.

## Tests And Review Checklist

Test the feature form module when it has validation or transformations:

- valid UI values produce the expected API input;
- optional empty values become `null` where required;
- trimming and dynamic-record mapping are correct;
- invalid values produce the intended field or general message.

Before finishing a form page, verify:

- add and edit use the same field layout;
- one panel `Card` contains the form;
- the page remains recognizable during edit loading;
- every async child section receives or derives the correct loading state;
- initial-load failure has a retry action;
- submit is disabled during initial loading and submission;
- field, form, load, and network errors appear in the correct place;
- the submit handler returns `{}` or `{ error }` on every path;
- cache invalidation/update, notification, and navigation happen only after success;
- the page works with a narrow mobile viewport and an explicit scroll container;
- the relevant tests and `bun run check` pass.
