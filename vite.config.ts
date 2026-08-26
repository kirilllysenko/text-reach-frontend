import tailwindcss from "@tailwindcss/vite";
import solid from "@solidjs/vite-plugin";
import { routePathFromFile } from "filesystem-routing";
import { fileRoutes } from "filesystem-routing/vite";
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
      proxy.on("proxyReq", (proxyRequest, request) => {
        if (request.headers.origin) {
          proxyRequest.setHeader("origin", target);
        }
      });

      proxy.on("proxyRes", (proxyResponse) => {
        proxyResponse.headers["set-cookie"] = allowLocalHttpCookies(proxyResponse.headers["set-cookie"]);
      });
    },
  };
}

function svelteRoutePath(routeFile: string): string | undefined {
  if (routeFile === "/+layout") return undefined;
  if (routeFile.endsWith("/+layout")) {
    return routePathFromFile(routeFile.slice(0, -"/+layout".length));
  }
  if (!routeFile.endsWith("/+page")) return undefined;

  const routePath = routePathFromFile(routeFile.replace(/\+page$/, "index"));
  return routePath.startsWith("/*") ? routePath.replace(/\/$/, "") : routePath;
}

export default defineConfig({
  publicDir: "static",
  plugins: [
    solid({ extensions: [".jsx", ".tsx"] }),
    fileRoutes({ toPath: svelteRoutePath, types: "src/file-routes.d.ts" }),
    tailwindcss(),
  ],
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
    },
  },
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
