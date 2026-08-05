/// <reference types="houdini-svelte" />

/** @type {import("houdini").ConfigFile} */
const config = {
  url: "/graphql",
  watchSchema: {
    url: (env) => env.HIVE_ROUTER_URL ?? "http://localhost:4000/graphql",
  },
  scalars: {
    Date: { type: "string" },
    DateTime: { type: "string" },
    DateTimeTimezone: { type: "string" },
    JSON: { type: "unknown" },
    Long: { type: "number" },
    Ulid: { type: "string" },
  },
  plugins: {
    "houdini-svelte": {
      client: "./src/lib/graphql/client.ts",
      forceRunesMode: true,
      framework: "kit",
      static: true,
    },
  },
};

export default config;
