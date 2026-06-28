import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import type { ProxyOptions } from "vite";
import { defineConfig } from "vite";

function createApiProxy(target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on("proxyReq", (proxyReq, req) => {
        if (!req.headers.origin) {
          return;
        }

        proxyReq.setHeader("origin", target);
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    proxy: {
      "/auth": createApiProxy("http://localhost:8081"),
      "/tenant": createApiProxy("http://localhost:8089"),
      "^/contact(?:/|$)": createApiProxy("http://localhost:8083"),
      "/phone": createApiProxy("http://localhost:8088"),
      "/campaign": createApiProxy("http://localhost:8082"),
    },
  },
});
