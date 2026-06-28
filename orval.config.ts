import { defineConfig } from "orval";

export default defineConfig({
  backend: {
    input: {
      target: "./backend.openapi.json",
    },
    output: {
      target: "./src/lib/api/index.ts",
      mode: "tags-split",
      client: "fetch",
      clean: true,
      headers: true,
      prettier: true,
    },
    hooks: {
      afterAllFilesWrite: "bun ./scripts/fix-orval-response-type-casing.mjs",
    },
  },
});
