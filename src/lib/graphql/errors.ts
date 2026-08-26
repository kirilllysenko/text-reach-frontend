import type { CombinedError } from "@urql/core";

export function graphQLErrorCode(error: CombinedError | null | undefined): string | undefined {
  return error?.graphQLErrors
    .map((graphQLError) => graphQLError.extensions?.code)
    .find((code): code is string => typeof code === "string");
}

export function graphQLErrorMessage(error: CombinedError | null | undefined): string | undefined {
  return error?.graphQLErrors.map((graphQLError) => graphQLError.message).find((message) => message.length > 0);
}
