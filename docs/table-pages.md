# Table Pages

Use this structure for data tables and for list pages that reuse the table sorting and filtering services.

```text
(list)/
├── +page.svelte
└── components/
    ├── FeatureSearchInput.svelte
    ├── filter/
    │   ├── FilterButton.svelte
    │   └── filter.svelte.ts
    ├── sort/
    │   ├── SortButton.svelte
    │   └── sort.svelte.ts
    └── table/
        ├── FeatureTableQuery.graphql
        ├── column.svelte.ts
        ├── table.svelte.ts
        └── FeatureActionCell.svelte
```

Keep only the folders that the page needs. An action cell belongs in `table/` because it is part of the table. A custom
filter control belongs in `filter/` because it is part of that filter definition.

## Page composition

The route `+page.svelte` owns the visible page composition: `PageTitle`, toolbar `Card`, search, filter and sort buttons,
and the table `Card`. Render the shared `Table` directly inside `Card variant="table"`.

Do not create a `FeaturePage.svelte` that merely moves the whole route out of `+page.svelte`, or a
`FeatureTable.svelte` that only renders `Card` and `Table`. Extract a component when it owns meaningful independent UI,
state, or behavior—not to hide the standard page structure.

## Query colocation

Put a table's GraphQL query next to `table.svelte.ts`, which owns the generated Houdini store and executes the request.
Derive row and variable types from the generated artifact and generated GraphQL inputs. Prefer returning query nodes
directly instead of copying every field into a route-specific view model.

Keep a query under `src/lib/feature` only when multiple unrelated routes or components genuinely execute that same
operation as shared behavior. Reuse alone is not a reason to move a component-owned query away from its owner; separate
owners may have separate operations.

The table loader should:

1. Read pagination, the composed backend filter, and sorts from `DataTableLoadRequest`.
   Pagination already uses the backend connection arguments: `after`/`first` for forward loads,
   `before`/`last` for backward loads, and `offset`/`first` for an uncached page jump.
2. Build the connection variables, adding only page-specific constraints such as a route ID or search clause.
3. Pass `request.filter` and `request.sorts` to the backend without DTO conversion.
4. Return rows, cursors, and `totalRows` from the connection.
5. Throw deliberately written generic user-facing errors. Never expose backend GraphQL messages.

## Backend sorting

For a server-backed table, parameterize `DatagridCore` with the generated Houdini sort type and store those objects
directly in `SortingService`.

```ts
const defineSort = backendSortDefinition<ContactSortByInput>();

export const contactSortDefinitions = [
  defineSort({ field: "lastName", label: "Last name" }),
  defineSort({ field: "firstName", label: "First name" }),
] as const;

export const initialContactSorts = [{ lastName: { direction: "ASC" } }] satisfies ContactSortByInput[];
```

Pass `table.handlers.sorting` to `SortPanel` or a route-specific button. The service is the single source of truth. Do
not duplicate it with component `$state`, `bind:` plus change callbacks, effects, or `toBackend` conversion helpers.

Configure table behavior as a flat feature list. Feature factories use public names such as `definitions`,
`initialSorts`, and `initialFilters`; do not configure new tables through the legacy nested `initialState` object.

```ts
return new DatagridCore<ContactTableRow, ContactSortByInput, ContactFilterInput>({
  columns: createContactColumns(),
  features: [
    sortingFeature<ContactSortByInput>({
      definitions: contactSortDefinitions,
      initialSorts: [...initialContactSorts],
    }),
    filteringFeature<ContactFilterInput>({ definitions: contactFilterDefinitions }),
    dataLoadingFeature<ContactTableRow, ContactSortByInput, ContactFilterInput>({
      loader: (request) => fetchContactRows(contactsQuery, request),
    }),
  ],
});
```

For a fully local table, use `DataTableSort` and `sortDefinition`. Local definitions may provide a field or value getter
because the client performs the comparison.

## Backend filtering

For a server-backed table, parameterize `DatagridCore` with the generated Houdini filter type and store those objects
directly in `FilteringService`.

```ts
const defineFilter = backendFilterDefinition<ContactFilterInput>();

export const contactFilterDefinitions = [
  defineFilter.text({
    filterId: "emailContains",
    field: "email",
    label: "Email contains",
    defaultOperator: "CONTAINS",
  }),
] as const;
```

Pass `table.handlers.filtering` to `FilterPanel` or a route-specific button. Do not keep a separate array of filter DTOs
or add `toDto`, `toDtos`, or `toBackend` services. A definition-level `value.toBackend`/`fromBackend` pair is appropriate
only when the control value and API scalar truly differ, such as dollars versus micros or a date input versus a UTC
timestamp.

For a fully local table, use `DataTableFilter` and local filter definitions such as `containmentFilter`.

## Search and lifecycle

When search maps naturally to one backend filter, define a hidden backend filter and let `FilteringService` own it. When
search needs a page-specific compound expression, keep the bindable search value in `+page.svelte`, pass a getter into
the table factory, and debounce `table.handlers.dataLoading.reload("search")` from the search input.

Server-backed tables let `DataLoadingService` own loading, cancellation, stale-response protection, and errors. Render
`table.features.dataLoading.loading` and `table.features.dataLoading.error`. Refresh after a mutation or import through
`table.handlers.dataLoading.reload()`.

If an endpoint can only return the complete dataset, load it beside `table.svelte.ts`, replace the table data once, and
let local search, filtering, sorting, and pagination process it. Do not imitate backend pagination with a second route
state object.
