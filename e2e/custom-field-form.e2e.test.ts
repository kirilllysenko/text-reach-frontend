import { afterAll, beforeAll, describe, expect, it } from "vitest";
import puppeteer, { type Browser, type HTTPRequest, type Page } from "puppeteer";
import { createServer, type ViteDevServer } from "vite";

interface ApiCall {
  body: unknown;
  method: string;
  path: string;
}

interface ApiResponse {
  body?: unknown;
  status: number;
}

type ApiHandler = (request: HTTPRequest, path: string) => ApiResponse | undefined;

const customFieldId = "01J00000000000000000000000";

let server: ViteDevServer;
let browser: Browser;
let baseUrl: string;

beforeAll(async () => {
  server = await createServer({
    logLevel: "error",
    server: {
      host: "127.0.0.1",
      port: 0,
    },
  });

  await server.listen();

  const address = server.httpServer?.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to determine Vite dev server address.");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
  browser = await puppeteer.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

describe.sequential("custom field form pages", () => {
  it("validates and creates a custom field", async () => {
    const { page, calls } = await createMockedPage((request, path) => {
      if (request.method() === "POST" && path === "/contact/custom-fields") {
        return { status: 200, body: { id: customFieldId } };
      }
    });

    try {
      await gotoAppPage(page, "/custom-fields/add");

      await page.click('button[type="submit"]');
      await page.waitForFunction(() => document.body.textContent?.includes("Required"));
      expect(calls.some((call) => call.method === "POST" && call.path === "/contact/custom-fields")).toBe(false);

      await replaceInputValue(page, "#custom-field-name", "VIP tier");
      await chooseComboboxOption(page, "#custom-field-type", "Number");

      const createRequest = page.waitForRequest(
        (request) => request.method() === "POST" && new URL(request.url()).pathname === "/contact/custom-fields",
      );

      await page.click('button[type="submit"]');

      const request = await createRequest;
      expect(JSON.parse(request.postData() ?? "{}")).toEqual({
        name: "VIP tier",
        type: "NUMBER",
      });

      await page.waitForFunction(() => window.location.pathname === "/custom-fields");
    } finally {
      await page.close();
    }
  });

  it("loads and edits an existing custom field name", async () => {
    const { page } = await createMockedPage((request, path) => {
      if (request.method() === "GET" && path === `/contact/custom-fields/${customFieldId}`) {
        return {
          status: 200,
          body: {
            id: customFieldId,
            name: "Lead source",
            position: "1",
            type: "DATE",
          },
        };
      }

      if (request.method() === "PUT" && path === `/contact/custom-fields/${customFieldId}/name`) {
        return { status: 200, body: {} };
      }
    });

    try {
      await gotoAppPage(page, `/custom-fields/${customFieldId}/edit`);

      await page.waitForFunction(() => {
        const nameInput = document.querySelector<HTMLInputElement>("#custom-field-name");
        return nameInput?.value === "Lead source";
      });

      expect(await inputValue(page, "#custom-field-type")).toBe("Date");
      expect(await inputDisabled(page, "#custom-field-type")).toBe(true);
      expect(await submitDisabled(page)).toBe(true);

      await replaceInputValue(page, "#custom-field-name", "Customer birthday");
      await page.waitForFunction(() => !document.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled);

      const updateRequest = page.waitForRequest(
        (request) =>
          request.method() === "PUT" &&
          new URL(request.url()).pathname === `/contact/custom-fields/${customFieldId}/name`,
      );

      await page.click('button[type="submit"]');

      const request = await updateRequest;
      expect(JSON.parse(request.postData() ?? "{}")).toEqual({
        name: "Customer birthday",
      });

      await page.waitForFunction(() => window.location.pathname === "/custom-fields");
    } finally {
      await page.close();
    }
  });
});

async function createMockedPage(handler?: ApiHandler): Promise<{ calls: ApiCall[]; page: Page }> {
  const page = await browser.newPage();
  const calls: ApiCall[] = [];

  await page.setRequestInterception(true);

  page.on("request", async (request) => {
    const url = new URL(request.url());

    if (url.origin !== baseUrl || !isApiPath(url.pathname)) {
      await request.continue();
      return;
    }

    calls.push({
      body: parseRequestBody(request.postData()),
      method: request.method(),
      path: url.pathname,
    });

    const response = handler?.(request, url.pathname) ?? defaultApiResponse(request, url.pathname);
    await request.respond({
      body: JSON.stringify(response.body ?? {}),
      contentType: "application/json",
      status: response.status,
    });
  });

  return { calls, page };
}

function defaultApiResponse(request: HTTPRequest, path: string): ApiResponse {
  if (request.method() === "GET" && path === "/auth/check-session") {
    return { status: 200 };
  }

  if (request.method() === "GET" && path === "/tenant/profile") {
    return {
      status: 200,
      body: {
        email: "owner@example.com",
        name: "Owner",
      },
    };
  }

  if (request.method() === "GET" && path === "/contact/custom-fields") {
    return { status: 200, body: [] };
  }

  return {
    status: 404,
    body: {
      errorCode: "NOT_FOUND",
      errorDescription: `No e2e mock for ${request.method()} ${path}`,
    },
  };
}

function isApiPath(path: string): boolean {
  return path.startsWith("/auth/") || path.startsWith("/tenant/") || path.startsWith("/contact/");
}

function parseRequestBody(body: string | undefined): unknown {
  if (!body) {
    return undefined;
  }

  return JSON.parse(body);
}

async function gotoAppPage(page: Page, path: string): Promise<void> {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle0" });
  await page.waitForSelector("#custom-field-name");
}

async function replaceInputValue(page: Page, selector: string, value: string): Promise<void> {
  await page.$eval(selector, (node) => {
    const input = node as HTMLInputElement;
    input.focus();
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.type(selector, value);
}

async function chooseComboboxOption(page: Page, selector: string, label: string): Promise<void> {
  await page.click(selector);
  await page.waitForSelector('[role="option"]');
  await page.$$eval(
    '[role="option"]',
    (options, expectedLabel) => {
      const option = options.find((node) => node.textContent?.trim() === expectedLabel);

      if (!(option instanceof HTMLButtonElement)) {
        throw new Error(`Combobox option ${expectedLabel} was not found.`);
      }

      option.click();
    },
    label,
  );
}

async function inputValue(page: Page, selector: string): Promise<string> {
  return page.$eval(selector, (node) => (node as HTMLInputElement).value);
}

async function inputDisabled(page: Page, selector: string): Promise<boolean> {
  return page.$eval(selector, (node) => (node as HTMLInputElement).disabled);
}

async function submitDisabled(page: Page): Promise<boolean> {
  return page.$eval('button[type="submit"]', (node) => (node as HTMLButtonElement).disabled);
}
