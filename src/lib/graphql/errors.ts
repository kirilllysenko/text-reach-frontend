import { defaultErrorText } from "$lib/form/errors";

interface GraphQLErrorLike {
  message: string;
  extensions?: object | null;
}

export function graphQLErrorCode(errors: readonly GraphQLErrorLike[] | null | undefined): string | undefined {
  const code = errors
    ?.map((error) => (error.extensions as { code?: unknown } | undefined)?.code)
    .find((value): value is string => typeof value === "string");

  return code;
}

export function toGraphQLErrorText(errors: readonly GraphQLErrorLike[] | null | undefined): string {
  const description = errors
    ?.map((error) => (error.extensions as { errorDescription?: unknown } | undefined)?.errorDescription)
    .find((errorDescription): errorDescription is string => typeof errorDescription === "string");

  if (description) {
    return description;
  }

  return errors?.map((error) => error.message).join(". ") || defaultErrorText;
}
