# Frontend engineering rules

## Architecture

- One client-rendered SolidJS 2 application serves web and Capacitor. Do not introduce runtime SSR or SolidStart.
- Define routes through the filesystem in `src/routes` and keep page implementations with their route entries.
- Mirror the former SvelteKit route hierarchy, including `(app)`, `(list)`, `(form)`, and `(routes)` pathless groups.
- Keep `src/app.tsx` limited to the generated route manifest and application-wide providers.
- Colocate page-only components, helpers, and GraphQL operations with the owning route. Use pathless route groups for
  code shared by related routes, such as add and edit pages.
- Reusable presentation belongs in `src/components`; reusable business logic belongs in `src/lib/feature/<feature>`.
- Shared mutable state belongs in `src/lib/state`. It must be composed from signals or stores and plain functions.
  Never wrap state in a class or singleton class instance.
- Keep page-only helpers and components beside their page. Do not import from one page into another.

## Data and state

- Use URQL for all GraphQL operations. Keep one operation per `.graphql` file and colocate it with the page, component,
  state module, or feature that uses it.
- Generate typed documents in `src/gql` with `bun run generate:graphql`; do not edit generated files manually.
- Show safe generic error messages unless the backend error code maps to an explicitly supported user-facing state.
- Use Solid signals and stores for local and imported shared state. Prefer derived memos over synchronized duplicate state.
- Do not add Solid Query, a form library, or a table library.

## UI

- Use Virtua for large or unbounded lists. The shared `VirtualTable` handles virtualized tabular layouts without a table
  framework.
- Keep the checked-in Virtua compatibility patch until Virtua publishes a SolidJS 2-compatible Solid adapter.
- Put static class strings on elements. Use arrays with the shared `classes` helper for conditional classes.
- Preserve visible labels, keyboard access, focus behavior, touch-sized controls, and non-hover access to core actions.
- Account for safe areas and explicit scrolling in Capacitor webviews.
- Wrapper components must spread supported native props onto their inner element.

## Forms

- Use controlled Solid signals or stores and native form submission.
- Keep validation in plain functions or Zod schemas. Put server mutations, navigation, notifications, and cache updates in
  the page or feature action that owns the workflow.
- Never build form state as a class.

## Verification

Use `bun` and `bunx`. Before handing off changes, run the checks appropriate to the change:

```sh
bun run generate:graphql
bun run check
bun run test
bun run build
```

Run `bun run test:e2e` when route behavior or a complete user workflow changes.

Further guidance:

- `docs/form-pages.md`
- `docs/table-pages.md`
- `docs/project-structure.md`
- `docs/component-quality.md`
- `docs/solid-capacitor.md`
