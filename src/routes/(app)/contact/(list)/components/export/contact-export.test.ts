import { describe, expect, it } from "vitest";
import type { ContactFilterInput, ContactSortByInput } from "$houdini/graphql/inputs";
import { buildContactExportRequest, toContactCsv, type ContactExportRow } from "./contact-export";

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

const contacts = [
  {
    birthday: "1992-01-01",
    contactGroups: [{ id: "group-a" }],
    email: "ava@example.com",
    firstName: "Ava",
    id: "one",
    lastName: "One",
    notes: "",
    phoneNumber: "111",
  },
  {
    birthday: "1994-01-01",
    contactGroups: [{ id: "group-b" }],
    email: "bea@example.com",
    firstName: "Bea",
    id: "two",
    lastName: "Two",
    notes: "",
    phoneNumber: "222",
  },
  {
    birthday: "1996-01-01",
    contactGroups: [{ id: "group-b" }],
    email: "cam@example.com",
    firstName: "Cam",
    id: "three",
    lastName: "Three",
    notes: "",
    phoneNumber: "333",
  },
] satisfies ContactExportRow[];

describe("contact export helpers", () => {
  it("builds export requests from the visible table snapshot", () => {
    expect(buildContactExportRequest(filteredSnapshot, "cursor")).toEqual({
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
      after: "cursor",
      first: 500,
      sortBy: [
        {
          firstName: {
            direction: "DESC",
          },
        },
      ],
    });
  });

  it("escapes CSV cells and exports contact group ids", () => {
    expect(
      toContactCsv([
        {
          ...contacts[0],
          contactGroups: [{ id: "group-a" }, { id: "missing-group" }],
          notes: 'Line one\nLine "two"',
        },
      ]),
    ).toBe(
      'First Name,Last Name,Phone Number,Email,Birthday,Groups,Notes\nAva,One,111,ava@example.com,1992-01-01,group-a; missing-group,"Line one\nLine ""two"""',
    );
  });
});
