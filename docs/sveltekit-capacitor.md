# SvelteKit And Capacitor Rules

This app targets the web and Capacitor. Code must work as a static SvelteKit app inside a native webview.

## Rendering And Routing

- Preserve `@sveltejs/adapter-static`.
- Preserve `fallback: "index.html"` so deep links can resolve in Capacitor and static hosting.
- Preserve `kit.paths.relative = true` unless there is a tested reason to change it.
- Do not introduce runtime SSR-only behavior. This app should not rely on a request-time SvelteKit server.
- Static public pages may use `prerender = true` with page SSR enabled to generate HTML at build time.
- Capacitor builds may disable page SSR when static HTML output is not needed or causes native-container issues.
- Do not add server routes, form actions, server hooks, or server-only modules for app behavior.
- Static pages may use SSG when appropriate.
- Browser-only APIs must run after mount or inside guarded code.

## Data Loading

- Prefer client-side data loading through feature API adapters for authenticated app flows.
- Keep route load functions static-safe. Do not depend on request-time server context.
- Keep auth/session assumptions in shared state or API layers, not duplicated in pages.
- Avoid direct `fetch` calls in Svelte templates or deeply nested UI components.

## Capacitor Safety

- Treat the runtime as a webview that can have different viewport, safe-area, network, and lifecycle behavior.
- Respect safe-area insets for fixed headers, footers, sheets, and bottom navigation.
- Avoid hard dependencies on browser features that are unavailable or inconsistent in webviews.
- Guard `window`, `document`, `localStorage`, `matchMedia`, observers, and navigation APIs when code can run during build.
- Keep touch targets comfortably tappable.
- Make scroll containers explicit on mobile sheets, dialogs, and full-height layouts.
- Avoid relying on hover-only interactions for core functionality.
- Handle offline, timeout, and failed-network states in user-facing flows.

## Build And Tooling

- Use `bun` or `bunx`, never `npm` or `npx`.
- Keep SvelteKit, Vite, Tailwind, and Capacitor configuration minimal and explicit.
- Run `bun run check` after TypeScript or Svelte changes.
- Run `bun run lint` after broad formatting or markup changes.
- If a change affects Capacitor-specific behavior, verify the generated static app path and note any native follow-up needed.

## Platform Boundaries

- Keep native-only APIs behind small platform helpers if they are introduced.
- Do not mix Capacitor plugin calls directly into generic UI primitives.
- Keep web fallbacks for native behavior whenever possible.
- Prefer progressive enhancement over platform branching in component markup.
