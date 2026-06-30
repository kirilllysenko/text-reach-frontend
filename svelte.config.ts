import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config: import("@sveltejs/kit").Config = {
  kit: {
    adapter: adapter({
      fallback: "index.html",
    }),
    paths: {
      relative: true,
    },
  },
  vitePlugin: {
    dynamicCompileOptions: ({ filename }) =>
      filename.includes("node_modules") ? undefined : { runes: true },
  },
};

export default config;
