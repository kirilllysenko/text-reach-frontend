import type { Page, Request } from "@playwright/test";

interface GraphQLRequest {
  operationName?: string;
  query?: string;
  variables?: Record<string, unknown>;
}

interface GraphQLResponse {
  data?: Record<string, unknown> | null;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

type GraphQLResolver = (
  variables: Record<string, unknown>,
  request: Request,
) => GraphQLResponse | Promise<GraphQLResponse>;

export type GraphQLResolvers = Record<string, GraphQLResolver>;

function operationName(payload: GraphQLRequest): string | null {
  if (payload.operationName) {
    return payload.operationName;
  }

  return payload.query?.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/)?.[1] ?? null;
}

export function graphQLError(code: string, message = code): GraphQLResponse {
  return {
    data: null,
    errors: [{ message, extensions: { code } }],
  };
}

export async function mockGraphQL(page: Page, resolvers: GraphQLResolvers): Promise<void> {
  await page.route("**/graphql", async (route) => {
    const request = route.request();
    const payload = request.postDataJSON() as GraphQLRequest;
    const name = operationName(payload);
    const resolver = name ? resolvers[name] : undefined;

    if (!resolver) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify(
          graphQLError("UNEXPECTED_OPERATION", `Unexpected GraphQL operation: ${name ?? "unknown"}`),
        ),
      });
      return;
    }

    const response = await resolver(payload.variables ?? {}, request);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

export const inactiveSessionResponse: GraphQLResponse = {
  data: { checkSession: false },
};

export const activeSessionResponse: GraphQLResponse = {
  data: { checkSession: true },
};

export const profileResponse: GraphQLResponse = {
  data: {
    profile: {
      accessGroups: [],
      email: "owner@example.com",
      name: "Workspace Owner",
    },
  },
};
