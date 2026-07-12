import type { ErrorResponse } from "$lib/api/index.schemas";
import { countContacts as countContactList, fetchContacts as fetchContactList } from "$lib/api/contact/contact";
import {
  DatagridCore,
  type DataField,
  type DataTableLoadRequest,
  type DataTableLoadResult,
  type DataTableSort,
} from "$lib/components/table";
import { toContactViewModel } from "$lib/feature/contact/contact-display";
import { buildContactFilter, buildContactRequest } from "$lib/feature/contact/contact-query";
import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";
import { createContactFilterDefinitions, getContactTableFilters, type ContactTableFilters } from "../filter/filter.svelte";
import { contactSortDefinitions, getContactSortRules } from "../sort/sort.svelte";
import { createContactColumns } from "./column.svelte";

const PAGE_SIZE = 500;
const initialSorting = [
  { sortId: "lastName", direction: "ascending" },
  { sortId: "firstName", direction: "ascending" },
] satisfies DataTableSort[];

export const table = createContactTable();

function createContactTable(): DatagridCore<ContactViewModel> {
  return new DatagridCore<ContactViewModel>({
    columns: createContactColumns(),
    data: [],
    dataFields: createContactDataFields(),
    initialState: {
      dataLoading: {
        loader: fetchContactRows,
      },
      filtering: {
        filterDefinitions: createContactFilterDefinitions(),
      },
      pagination: {
        manual: true,
        pageSize: PAGE_SIZE,
      },
      sorting: {
        sortDefinitions: contactSortDefinitions,
        sorts: initialSorting,
      },
    },
    rowIdGetter: (contact: ContactViewModel) => contact.id,
  });
}

async function fetchContactRows(request: DataTableLoadRequest): Promise<DataTableLoadResult<ContactViewModel>> {
  const filters = getContactTableFilters(request.filters);
  const totalRows = await fetchContactCount(filters, request.signal);

  const pageRequest = buildContactRequest({
    pageSize: request.limit,
    cursor: request.cursor,
    direction: request.direction ?? "next",
    offset: request.offset,
    search: filters.search,
    contactGroupIds: filters.contactGroupIds,
    birthdayAfter: filters.birthdayAfter,
    emailContains: filters.emailContains,
    sortRules: getContactSortRules(request.sorts),
  });

  try {
    const response = await fetchContactList(pageRequest, { credentials: "include", signal: request.signal });

    if (response.status !== 200) {
      throw new Error(getContactErrorMessage(response.data as ErrorResponse));
    }

    return {
      rows: (response.data.items ?? []).map((item, index) => toContactViewModel(item, index)),
      nextCursor: response.data.nextCursor ?? null,
      totalRows,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Could not load contacts from API.");
  }
}

async function fetchContactCount(filters: ContactTableFilters, signal?: AbortSignal): Promise<number> {
  const filter = buildContactFilter({
    search: filters.search,
    contactGroupIds: filters.contactGroupIds,
    birthdayAfter: filters.birthdayAfter,
    emailContains: filters.emailContains,
  });

  try {
    const response = await countContactList(filter ?? {}, { credentials: "include", signal });

    if (response.status !== 200) {
      throw new Error(getContactErrorMessage(response.data as ErrorResponse, "Could not count contacts."));
    }

    return response.data;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Could not count contacts.");
  }
}

function getContactErrorMessage(error?: ErrorResponse, fallback = "Could not load contacts from API."): string {
  return error?.errorDescription ?? fallback;
}

function createContactDataFields(): DataField<ContactViewModel>[] {
  return [
    {
      fieldId: "firstName",
      getValueFn: (contact) => contact.firstName,
      sortable: true,
    },
    {
      fieldId: "lastName",
      getValueFn: (contact) => contact.lastName,
      sortable: true,
    },
    {
      fieldId: "phoneNumber",
      getValueFn: (contact) => contact.phoneNumber,
      sortable: true,
    },
    {
      fieldId: "search",
      getValueFn: (contact) =>
        [contact.fullName, contact.phoneNumber, contact.email, contact.notes].filter(Boolean).join(" "),
      filterable: true,
    },
    {
      fieldId: "email",
      getValueFn: (contact) => contact.email,
      filterable: true,
      sortable: true,
    },
    {
      fieldId: "birthday",
      getValueFn: (contact) => contact.birthday,
      filterable: true,
      sortable: true,
    },
    {
      fieldId: "contactGroupIds",
      getValueFn: (contact) => contact.contactGroupIds,
      filterable: true,
    },
  ];
}
