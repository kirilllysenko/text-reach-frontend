# Component quality

- A component should own a meaningful visual or behavioral unit, not merely forward application props.
- Preserve native element behavior and spread supported remaining props onto the inner element.
- Keep static classes on JSX elements and use arrays with `classes` for conditional styles.
- Use semantic elements, connected labels, accessible names, keyboard interaction, and visible focus states.
- Avoid effects when a memo or event handler expresses the relationship directly.
- Clean up timers, global listeners, subscriptions, and WebSockets with `onCleanup`.
- Keep important controls usable without hover and large enough for touch input.
