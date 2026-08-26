# Form pages

Use native forms, Solid signals or stores, and plain validation functions. Do not add a form library and do not create a
form-state class.

- The page owns loading, mutations, navigation, notifications, and GraphQL cache updates.
- Reusable form sections may be components when they own meaningful fields and behavior.
- Keep simple field markup in the page instead of making pass-through components.
- Validate before sending a mutation and map only supported backend error codes to field errors.
- Disable or show progress on submit controls while a request is active.
- Spread native input and button props through wrapper components.
- Preserve labels, descriptions, error associations, autocomplete, input modes, and keyboard submission.
- Add and edit pages may share plain schemas, input conversion functions, and substantive field sections, but each page
  should keep its own workflow effects clear.
