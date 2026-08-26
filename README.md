# Text Reach frontend

A static client-rendered SolidJS application for web and Capacitor.

## Stack

- SolidJS 2 (`2.0.0-rc.2`), Router 2, and filesystem routing
- Vite and Tailwind CSS
- URQL and generated GraphQL document types
- Virtua for virtual lists and tables
- Vitest and Playwright

The project intentionally does not use SolidStart, a form library, Solid Query, or a table library.

SolidJS 2 is currently a release candidate. The versions in `package.json` are pinned so framework, renderer, router,
metadata, testing, and Vite integration packages advance together.

## Development

```sh
bun install
bun run dev
```

The development server proxies `/graphql` to `http://localhost:4000`, `/live-update` to the local WebSocket service,
and supports an optional `E2E_STORAGE_TARGET` for storage uploads.

## Validation

```sh
bun run generate:graphql
bun run check
bun run test
bun run build
bun run test:e2e
```

`bun run build` writes the static application to `dist`, which is also the intended Capacitor `webDir`.

See `docs/README.md` for project-specific architecture and coding rules.
