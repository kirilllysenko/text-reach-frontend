# texting-frontend-svelte

Single-page SvelteKit app built with:

- Bun
- Tailwind CSS v4
- `@sveltejs/adapter-static` (configured for SPA fallback)

## Run locally

```sh
bun install
bun run dev
```

The local dev server proxies `/graphql` to the Hive Router at `http://localhost:4000`.

## Build

```sh
bun run build
bun run preview
```

Build output is generated in the `build/` folder.

## API Client Generation

This project uses Houdini and generates its GraphQL client by introspecting the running Hive Router.

```sh
bun run generate:graphql
```

Set `HIVE_ROUTER_URL` if the router is not available at the default URL.

Example usage:

```ts
import { CampaignListStore } from "$houdini";

const store = new CampaignListStore();
const result = await store.fetch({ variables: { first: 25 } });
console.log(result.data?.campaigns);
```

## Capacitor-ready notes

- SSR is disabled (`src/routes/+layout.ts`) so the app runs client-side.
- Static adapter uses `fallback: 'index.html'` so deep links resolve in a webview SPA context.
- Relative asset paths are enabled in `svelte.config.js` for better compatibility in mobile wrappers.
