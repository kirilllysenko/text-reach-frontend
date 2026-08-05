# Agent Rules

These docs extend `AGENTS.md`. This file is the compact source of truth; the topic files in `docs/` only point back here.

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
- Use `src/lib/components` for generic UI, `src/lib/state` for app-wide state, `src/lib/form` for form logic, `src/lib/utils` for utilities, and `src/lib/icons` for icons.
- Put GraphQL operations beside their feature under `src/lib/feature` and use the generated Houdini stores. Do not add REST clients for application business operations.

## Components

- Use Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`; use `$derived.by` for branched or multi-line derivations.
- Use typed `$props()`, snippets for owned child layout, and explicit props for meaningful inputs.
- For native wrappers, spread rest props onto the inner element. Do not write `class: classProp`; use a `class` rest prop or local class inside an array class.
- Put Tailwind classes on elements, use array classes for conditions, and wrap class strings longer than 120 characters.
- Keep transformations out of markup, effects clean, and state close to its use.
- Prefer semantic HTML, accessible labels/ARIA/keyboard handling, stable layout for text/icons/badges, and no nested cards unless the inner card is a repeated item or modal.
- Split components once markup, state, effects, and handlers stop being easy to scan, especially around 250 to 300 lines, repeated markup, independent visual regions, or section-local state.

## Workflow

- Follow existing local patterns before adding abstractions.
- Keep changes scoped to the touched route, feature, or shared primitive.
- Use `bun` and `bunx`, never `npm` or `npx`.
- Run the narrowest useful validation before handoff: usually `bun run check`, plus `bun run lint` after broad markup or formatting changes.

## GraphQL

- Hive Router is the source of truth for GraphQL generation. Houdini introspects `http://localhost:4000/graphql` by
  default; set `HIVE_ROUTER_URL` when the Router is available at another address.
- The backend's local and production Hive Router configurations must keep introspection enabled. Never generate from an
  individual subgraph, a copied client schema, or supergraph SDL.
- Run `bun run generate:graphql` while Hive Router is available after changing operations or publishing a new schema.
- `.houdini`, including Houdini's introspection cache, is generated and ignored. Houdini uses normalized records and the
  cache policies declared in each operation.
