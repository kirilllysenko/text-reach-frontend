import { describe, expect, it } from "vitest";
import type { DataTableFilter, DataTableSort } from "$lib/components/table";
import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";
import { buildContactExportRequest, toContactCsv } from "./contact-export";

const filteredSnapshot = {
  filters: [
    {
      filterId: "contactGroup",
      operator: "IN",
      type: "containment",
      value: ["group-b"],
    },
    {
      filterId: "birthdayAfter",
      operator: "GREATER_OR_EQUAL",
      type: "comparison",
      value: "1990-01-01",
    },
    {
      filterId: "emailContains",
      operator: "CONTAINS",
      type: "text",
      value: "example.com",
    },
  ] satisfies DataTableFilter[],
  search: "a",
  sorting: [
    {
      direction: "descending",
      sortId: "firstName",
    },
  ] satisfies DataTableSort[],
};

const contacts = [
  {
    id: "one",
    birthday: "1992-01-01",
    contactGroupIds: ["group-a"],
    email: "ava@example.com",
    firstName: "Ava",
    fullName: "Ava One",
    lastName: "One",
    notes: "",
    phoneNumber: "111",
  },
  {
    id: "two",
    birthday: "1994-01-01",
    contactGroupIds: ["group-b"],
    email: "bea@example.com",
    firstName: "Bea",
    fullName: "Bea Two",
    lastName: "Two",
    notes: "",
    phoneNumber: "222",
  },
  {
    id: "three",
    birthday: "1996-01-01",
    contactGroupIds: ["group-b"],
    email: "cam@example.com",
    firstName: "Cam",
    fullName: "Cam Three",
    lastName: "Three",
    notes: "",
    phoneNumber: "333",
  },
] satisfies ContactViewModel[];

describe("contact export helpers", () => {
  it("builds export requests from the visible table snapshot", () => {
    expect(buildContactExportRequest(filteredSnapshot, ["cursor"])).toEqual({
      filter: {
        nested: [
          {
            filter: "a",
          },
          {
            contactGroupId: {
              operator: "IN",
              value: ["group-b"],
            },
          },
          {
            birthday: {
              operator: "GREATER_OR_EQUAL",
              value: "1990-01-01",
            },
          },
          {
            email: {
              operator: "CONTAINS",
              value: "example.com",
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
          contactGroupIds: ["group-a", "missing-group"],
          notes: 'Line one\nLine "two"',
        },
      ]),
    ).toBe(
      'First Name,Last Name,Phone Number,Email,Birthday,Groups,Notes\nAva,One,111,ava@example.com,1992-01-01,group-a; missing-group,"Line one\nLine ""two"""',
    );
  });
});
