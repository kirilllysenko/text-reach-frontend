# Live contact end-to-end test

The Playwright suite signs in through the UI and runs against the live GraphQL backend. It only interacts with visible
controls and verifies rendered UI state. The test code does not directly issue, inspect, or mock API requests; backend
traffic is limited to requests the application naturally makes in response to those interactions.

The configured tenant must already contain at least 11 contacts so the suite can exercise sorting, search filtering,
and loading beyond the first 10-row page.

```sh
E2E_EMAIL='owner@example.com' \
E2E_PASSWORD='password' \
bun run test:e2e
```

The frontend proxies GraphQL to `http://localhost:4000` by default. Set `E2E_GRAPHQL_TARGET` to use another live Hive
Router endpoint. The suite is skipped when either credential is absent.
