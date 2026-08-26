import { describe, expect, it } from "vitest";
import type { ContactFilterInput, ContactSortByInput } from "$houdini/graphql/inputs";
import { buildContactExportRequest } from "./contact-export";

const filteredSnapshot = {
  filters: [
    {
      contactGroupId: { in: ["group-b"] },
    },
    {
      birthday: { greaterOrEqual: "1990-01-01" },
    },
    {
      email: { contains: "example.com" },
    },
  ] satisfies ContactFilterInput[],
  search: "a",
  sorts: [{ firstName: { direction: "DESC" } }] satisfies ContactSortByInput[],
};

describe("contact export helpers", () => {
  it("builds export requests from the visible table snapshot", () => {
    expect(buildContactExportRequest(filteredSnapshot)).toEqual({
      filter: {
        nested: [
          {
            filter: "a",
          },
          {
            contactGroupId: {
              in: ["group-b"],
            },
          },
          {
            birthday: {
              greaterOrEqual: "1990-01-01",
            },
          },
          {
            email: {
              contains: "example.com",
            },
          },
        ],
        operator: "AND",
      },
      format: "CSV",
      sortBy: [
        {
          firstName: {
            direction: "DESC",
          },
        },
      ],
    });
  });
});
