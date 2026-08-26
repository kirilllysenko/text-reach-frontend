# Agent Rules

These docs extend `AGENTS.md`. This file is the compact source of truth. Follow any topic guide linked from the
relevant section when working in that area.

## Platform

- Web and Capacitor share one static SvelteKit app.
- Preserve `@sveltejs/adapter-static`, `fallback: "index.html"`, and `kit.paths.relative = true`.
- Do not add runtime SSR dependencies, server routes, form actions, server hooks, or server-only app behavior.
- Static public pages may prerender. Authenticated flows should load data client-side through feature/API layers.
- Guard browser-only APIs during build or prerender: `window`, `document`, storage, observers, navigation, media queries.
- Treat Capacitor as a webview: account for safe areas, touch targets, explicit mobile scroll containers, offline/timeouts, and no hover-only core actions.

## Structure

- Keep `+page.svelte` and `+layout.svelte` thin. Put page-only components/helpers beside the route, usually in `components/`.
- Never import from one route directory into another; promote shared code to `src/lib`.
- Use `src/lib/feature/<feature>` for reused feature state, display mapping, query assembly, and business logic. Match suffixes: `*-state.svelte.ts`, `*-view-data.ts`, `*-display.ts`, `*-query.ts`.
- Use `text-reach-frontend-library` for generic UI, shared table infrastructure, and shared icons. Keep only
  app-specific component composition (such as the customer sidebar) in `src/lib/components`; use `src/lib/state` for
  app-wide product state, `src/lib/form` for form logic, and `src/lib/utils` for product utilities.
- Put component-owned GraphQL operations beside their component. Put genuinely shared feature operations under
  `src/lib/feature`, and use the generated Houdini stores. Do not add REST clients for application business operations.

## Components

- Use Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`; use `$derived.by` for branched or multi-line derivations.
- Use typed `$props()`, snippets for owned child layout, and explicit props for meaningful inputs.
- For native wrappers, spread rest props onto the inner element. Do not write `class: classProp`; use a `class` rest prop or local class inside an array class.
- Put Tailwind classes on elements, use array classes for conditions, and wrap class strings longer than 120 characters.
- Keep transformations out of markup, effects clean, and state close to its use.
- Prefer semantic HTML, accessible labels/ARIA/keyboard handling, stable layout for text/icons/badges, and no nested cards unless the inner card is a repeated item or modal.
- Split components once markup, state, effects, and handlers stop being easy to scan, especially around 250 to 300 lines, repeated markup, independent visual regions, or section-local state.

## Form Pages

- Follow [`form-pages.md`](form-pages.md) when creating or changing add/edit form routes.
- Keep API calls, initial edit-page loading, cache updates, notifications, and navigation in the route page.
- Keep form shape, initial values, validation, normalization, and the `create...Form` factory in `form.svelte.ts`.
- Use `Card` with `variant="panel"` as the single form surface. Keep `PageTitle` and navigation outside the card.
- Edit pages keep the page and form layout visible while loading. Pass `loading` through form sections to input
  primitives so they use the global animated skeleton; do not replace the whole page with a loading message.
- Keep the `<form>`, primary fields, general error, and actions directly in each add/edit `+page.svelte`. Do not create
  shared `...Form` or `...FormPage` components; extract only independent sections with their own state, query, or
  substantial markup.

## Table Pages

- Follow [`table-pages.md`](table-pages.md) when creating or changing a table or a list page with table-style sorting
  and filtering.
- Keep page composition in the route `+page.svelte`; do not add `...Page.svelte` or a pass-through `...Table.svelte`.
- Keep the query and loader beside `table.svelte.ts`, and pass generated Houdini filter and sort input objects directly
  between the table services and GraphQL variables.

## Workflow

- Follow existing local patterns before adding abstractions.
- Keep changes scoped to the touched route, feature, or shared primitive.
- Use `bun` and `bunx`, never `npm` or `npx`.
- Run the narrowest useful validation before handoff: usually `bun run check`, plus `bun run lint` after broad markup or formatting changes.

## GraphQL

- Put exactly one query in each `.graphql` file, and keep the file as close as possible to the component that uses it.
  It is reasonable to keep duplicate queries when different components own and execute them; do not centralize queries
  solely to remove that duplication.
- Never show backend error messages directly to users. In 99% of cases, show the generic message
  `There was an error.` instead.
- Only when a specific message would materially help the user, map a stable error code from the GraphQL error
  `extensions` to deliberately written, user-facing copy. Treat this as a rare exception; do not expose the backend
  message itself.
- Hive Router is the source of truth for GraphQL generation. Houdini introspects `http://localhost:4000/graphql` by
  default; set `HIVE_ROUTER_URL` when the Router is available at another address.
- The backend's local and production Hive Router configurations must keep introspection enabled. Never generate from an
  individual subgraph, a copied client schema, or supergraph SDL.
- Run `bun run generate:graphql` while Hive Router is available after changing operations or publishing a new schema.
- `.houdini`, including Houdini's introspection cache, is generated and ignored. Houdini uses normalized records and the
  cache policies declared in each operation.
