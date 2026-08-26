# Project instructions

Read `docs/README.md` and the relevant linked guides before changing project code. Treat those documents as binding.

## Coding rules

1. The app must work in both browsers and Capacitor webviews.
2. The app is a client-rendered static Vite application. Do not add runtime SSR or SolidStart.
3. Use SolidJS with `@solidjs/router`, URQL for GraphQL, and Virtua for virtualized lists.
4. Do not add a form library, Solid Query, a table library, or another virtual-list library.
5. Never create state classes. Export signals, stores, derived values, and plain functions from state modules; import and modify them directly.
6. Do not create classes for component styling in script constants. Put static classes on elements. For conditional classes, use arrays and the shared `classes` helper.
7. Split strings longer than 120 characters across lines when practical.
8. For wrapper components such as inputs and buttons, spread remaining native props onto the inner element.
9. Use `bun` and `bunx` for package and script commands.
10. Keep one operation per `.graphql` file, colocate it with its consumer, and regenerate types with `bun run generate:graphql`.
11. Keep page implementations and page-only code in `src/routes`, reusable UI in `src/components`, feature logic in
    `src/lib/feature`, and imported shared state in `src/lib/state`.
