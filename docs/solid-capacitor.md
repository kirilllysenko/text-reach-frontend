# SolidJS and Capacitor

- Build one static client-rendered application with Vite; `dist` is the Capacitor web directory.
- Do not add server-only loaders, runtime SSR, or SolidStart.
- Use web APIs only after the browser has mounted when they are unavailable during tooling or tests.
- Respect `env(safe-area-inset-*)`, dynamic viewport units, touch input, explicit scroll containers, and mobile keyboard
  behavior.
- Use relative application routes through `@solidjs/router`; keep API and upload endpoints configurable by environment.
- Treat network interruptions, session expiry, WebSocket reconnects, and upload failures as normal webview conditions.
