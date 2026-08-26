# Project structure

```text
src/
  app.tsx                 filesystem router and root providers
  entry-client.tsx        browser entry point
  components/             reusable UI
  gql/                    generated GraphQL artifacts
  lib/
    feature/              reusable feature logic
    form/                 plain validation and error helpers
    graphql/              URQL client and errors
    live-update/          WebSocket client
    state/                imported signals, stores, and actions
  routes/                 filesystem routes and their colocated page code
    +layout.tsx           root providers
    (app)/
      +layout.tsx         authenticated application layout
      campaign/
        +page.tsx         /campaign page implementation
        Campaigns.graphql
        components/       components used only by the campaign list
          CancelCampaign.graphql
          CampaignDetails.tsx
        (form)/
          (routes)/
            add/
              +page.tsx   /campaign/add page implementation
        [id]/
          messages/
            +page.tsx     /campaign/:id/messages
      contact/
        (list)/
          +page.tsx       /contact
        (form)/
          (routes)/
            add/
              +page.tsx   /contact/add
            [id]/
              edit/
                +page.tsx /contact/:id/edit
    sign-in/
      +page.tsx           /sign-in
    [...path]/
      +page.tsx           fallback route
static/                    copied static assets
```

The custom filesystem convention preserves the former SvelteKit `+page` and `+layout` names. Each `+page.tsx` contains
the route's page implementation. Parenthesized directories remain pathless route groups, so `(app)/+layout.tsx` applies
the authenticated shell without adding a URL segment.

Keep page-only components in a `components` folder beside the owning `+page.tsx`. Shared add/edit form UI may live in
the common pathless `(form)` group. Colocate each `.graphql` operation with the page, component, state module, or feature
that uses it. Put operations shared by multiple consumers at their nearest shared route or feature boundary. Keep
generated GraphQL artifacts in `src/gql` only.

Do not create cross-page imports. Promote reused presentation to `components` and reused behavior to the appropriate
`lib` folder. State modules must export signals, stores, memos, and plain actions—never classes.
