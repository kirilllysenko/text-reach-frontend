# List and table pages

Use the shared `VirtualTable` or Virtua directly for large collections. Do not add a table framework or another
virtualization package.

- The page owns search, filters, sorting, selection, pagination, and request state.
- Send generated GraphQL filter and sort inputs directly to URQL operations.
- Use a memo for visible or derived rows; do not synchronize a second copy with effects.
- Keep columns as typed data and extract a cell component only when it owns meaningful interaction.
- Fetch additional cursor pages without repeating a cursor and retain a stable row ID.
- Selection must be explicit and remain valid when rows reload or disappear.
- Loading, empty, error, and action states must remain keyboard-accessible and readable in narrow webviews.
