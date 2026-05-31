# AI Coding Rules

These docs extend `AGENTS.md` for the Text Reach frontend. Read them before changing code, and treat them as project rules for SvelteKit, Svelte 5, Tailwind, and Capacitor work.

## Read Order

1. `docs/project-structure.md` - where files belong and how boundaries are drawn.
2. `docs/component-quality.md` - how to keep Svelte components small, readable, and reusable.
3. `docs/sveltekit-capacitor.md` - platform, routing, rendering, and native-container constraints.

## Core Standards

- Use Svelte 5 runes and existing local patterns before adding new abstractions.
- Keep route files thin. Move page-specific UI into route-local components, and promote only reused/shared behavior to feature modules or shared components.
- Split large components before they become difficult to scan, especially when markup, state, effects, and event handling are mixed together.
- Preserve adapter-static, no-runtime-SSR assumptions, SSG for static pages, and Capacitor-safe browser code.
- Use generated API clients, backend models, and request DTOs. Do not hand-write backend API wrappers except for generator gaps such as file uploads or downloads.
- Use `bun` and `bunx` for scripts and package tooling.
- Run the narrowest useful validation before handing work back, usually `bun run check` and `bun run lint` for code changes.

When a rule here conflicts with local code that already clearly establishes a pattern, follow the local pattern and update these docs only if the rule is outdated.
