import { cacheExchange, Client, fetchExchange } from "@urql/core";

export const graphqlClient = new Client({
  url: "/graphql",
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    credentials: "include",
  },
});
