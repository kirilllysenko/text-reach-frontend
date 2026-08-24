import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import houdini from "houdini/vite";
import type { ProxyOptions } from "vite";
import { defineConfig } from "vite";

const graphqlProxyTarget = process.env.E2E_GRAPHQL_TARGET ?? "http://localhost:4000";
const storageProxyTarget = process.env.E2E_STORAGE_TARGET;

function allowLocalHttpCookies(setCookieHeaders: string[] | undefined): string[] | undefined {
  return setCookieHeaders?.map((cookie) => cookie.replace(/;\s*Secure/gi, ""));
}

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

      proxy.on("proxyRes", (proxyRes) => {
        proxyRes.headers["set-cookie"] = allowLocalHttpCookies(proxyRes.headers["set-cookie"]);
      });
    },
  };
}

export default defineConfig({
  plugins: [process.env.VITEST !== "true" && houdini(), tailwindcss(), sveltekit()],
  server: {
    proxy: {
      "/graphql": createApiProxy(graphqlProxyTarget),
      ...(storageProxyTarget
        ? {
            "/api": {
              target: storageProxyTarget,
              changeOrigin: true,
              rewrite: (path: string) => path.replace(/^\/api/, ""),
            },
          }
        : {}),
      "/live-update": {
        target: "ws://localhost:8092",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
