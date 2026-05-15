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

The local dev server proxies API calls to the backend services on these ports:

- `/auth` -> `http://localhost:8014`
- `/tenant` -> `http://localhost:8000`
- `/contact` -> `http://localhost:8001`
- `/phone` -> `http://localhost:8008`
- `/campaign` -> `http://localhost:8012`

## Build

```sh
bun run build
bun run preview
```

Build output is generated in the `build/` folder.

## API Client Generation

This project uses Orval with the `fetch` client.

```sh
bun run generate:api
```

The script:

- downloads OpenAPI specs from local backend services
- merges them into one schema
- runs Orval generation from `merged.yaml`

Main files:

- `generate-api-client.sh`
- `orval.config.ts`
- `src/lib/api/generated/` (generated)

Example usage:

```ts
import { listCampaigns } from "$lib/api/generated/campaign/campaign";

const result = await listCampaigns();
console.log(result.data, result.status, result.headers);
```

Override default docs URLs via env vars:

- `TENANT_API_DOCS_URL`
- `AUTH_API_DOCS_URL`
- `CONTACT_API_DOCS_URL`
- `PHONE_API_DOCS_URL`
- `CAMPAIGN_API_DOCS_URL`

## Capacitor-ready notes

- SSR is disabled (`src/routes/+layout.ts`) so the app runs client-side.
- Static adapter uses `fallback: 'index.html'` so deep links resolve in a webview SPA context.
- Relative asset paths are enabled in `svelte.config.js` for better compatibility in mobile wrappers.
