# Component Quality Rules

Svelte components should be easy to scan from top to bottom: imports, props, local state, derived values, handlers, markup, and styles.

## Splitting Components

Split large components when any of these are true:

- The file is around 250 to 300 lines and still growing.
- The template has distinct visual regions, such as header, list, filters, empty state, details panel, or footer.
- A block of markup repeats with only labels, values, status, or actions changing.
- State for one section is not needed by the rest of the file.
- Event handlers are easier to name as component callbacks than to keep inline.

Good split targets are semantic pieces like `CampaignListItem`, `CampaignFilterPanel`, `ProfileMenu`, or `ContactFormFields`. Avoid vague names like `Section`, `Wrapper`, or `Content` unless they are already meaningful in the feature.

## Props And Data Flow

- Use typed `$props()` interfaces.
- Use snippets for component children when the component owns layout around passed content.
- Prefer explicit props for meaningful component inputs.
- For native element wrappers, spread rest props onto the inner element instead of manually forwarding every prop.
- Do not write `class: classProp`. Use a `class` rest prop or local `classProp` and place it inside an array class in markup.
- Keep state as close as possible to where it is used.
- Lift state only when multiple siblings need the same source of truth.

## Svelte 5 Style

- Use runes consistently: `$state`, `$derived`, `$effect`, `$props`.
- Use `$derived.by` for derived values that need branches or multi-line logic.
- Keep complex transformations outside markup.
- Avoid side effects in derived values.
- Clean up browser listeners, timers, subscriptions, and observers.
- Prefer event handler functions when logic is more than a single obvious statement.

## Markup And Styling

- Write Tailwind classes on HTML elements, not in script variables.
- Use array classes for conditional classes.
- Break long class strings across multiple lines when they exceed 120 characters.
- Prefer semantic HTML elements before generic `div` elements.
- Add accessible names, labels, `aria-*`, and keyboard handling for interactive UI.
- Keep text, icons, badges, and counters from changing layout unexpectedly.
- Do not build nested cards unless the inner card is a distinct repeated item or modal content.

## Reuse

- Extract shared UI only after two or more places need the same behavior or the local pattern already exists.
- Keep feature-specific styling in feature components.
- Keep generic components visually flexible but behaviorally strict.
- Avoid abstractions that hide simple Svelte markup behind indirection.
