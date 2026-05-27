# Project Structure Rules

Use the existing structure as the default map. New code should make the current architecture easier to understand, not introduce a second style.

## Routes

- Keep `src/routes` focused on routing, layouts, loading, and page composition.
- Keep `+page.svelte` and `+layout.svelte` thin. They should wire feature components together, not contain large workflows.
- Route-only helpers and components may live beside the route when they are not reused, such as `src/routes/sign-in/PasswordInput.svelte`.
- Move route code into `src/lib/features/<feature>` when it is reusable, stateful, API-backed, or too large for a single page file.
- Do not import from one route directory into another route directory. Promote shared code to `src/lib`.

## Feature Modules

- Put feature-specific UI, models, state, and API adapters in `src/lib/features/<feature>`.
- Use clear suffixes that match the current codebase:
  - `<feature>-models.ts` for view models and feature-only types.
  - `<feature>-state.svelte.ts` for Svelte rune state and derived feature state.
  - `<feature>-api.ts` for feature-level API orchestration.
  - `PascalCase.svelte` for feature components.
- Feature components may depend on shared components and generated API types.
- Shared components should not depend on feature modules.
- Keep API normalization in feature adapters or model helpers so Svelte templates receive display-ready view models.

## Shared Library

- Put generic UI primitives in `src/lib/components/<component-name>`.
- Export shared primitives through the local component `index.ts` when that is the existing pattern.
- Put app-wide state in `src/lib/state` only when multiple routes or features truly share it.
- Put general form logic in `src/lib/form` and general utilities in `src/lib/utils`.
- Put icons in `src/lib/icons` unless adopting an icon library for a specific feature.
- Prefer `$lib/...` imports for library code.

## API Code

- Treat `src/lib/api` as generated API-client territory unless a file is clearly hand-authored.
- Do not manually edit generated API files as part of feature work. Update the generator or feature adapter instead.
- Keep backend endpoint assumptions in API adapters, not scattered through Svelte components.
- Validate external data at module boundaries when generated types are not enough.

## File Size And Ownership

- A file should have one primary reason to change.
- Split a component when it has multiple independent sections, unrelated event handlers, or repeated markup with different data.
- Prefer a small number of purposeful files over a flat pile of tiny one-use fragments.
- Keep tests, fixtures, and mocks near the feature they support when the project adds them.
