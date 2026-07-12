import { createRawSnippet, mount, unmount } from "svelte";
import {
  comparisonFilter,
  containmentFilter,
  textFilter,
  type DataTableFilter,
  type DataTableFilterFromDefinitions,
  type FilterDefinitionSnippetProps,
} from "$lib/components/table";
import type { MultiComboboxOption } from "$lib/components/dropdown";
import ContactGroupFilterControl from "./ContactGroupFilterControl.svelte";

const contactGroupDisplayById = new Map<string, string>();

export function createContactFilterDefinitions() {
  return [
    textFilter({
      filterId: "search",
      fieldId: "search",
      label: "Search",
      defaultOperator: "CONTAINS",
      hidden: true,
    }),
    containmentFilter({
      filterId: "contactGroup",
      fieldId: "contactGroupIds",
      label: "Groups",
      defaultOperator: "IN",
      formatValue: (value) =>
        Array.isArray(value)
          ? value.map((currentValue) => contactGroupDisplayById.get(currentValue) ?? currentValue).join(", ")
          : "",
      snippet: createContactGroupFilterSnippet(),
    }),
    comparisonFilter({
      filterId: "birthdayAfter",
      fieldId: "birthday",
      label: "Birthday after",
      defaultOperator: "GREATER_OR_EQUAL",
    }),
    textFilter({
      filterId: "emailContains",
      fieldId: "email",
      label: "Email contains",
      defaultOperator: "CONTAINS",
    }),
  ] as const;
}

export type ContactTableFilter = DataTableFilterFromDefinitions<ReturnType<typeof createContactFilterDefinitions>>;

export interface ContactTableFilters {
  birthdayAfter: string;
  contactGroupIds: string[];
  emailContains: string;
  search: string;
}

export function getContactTableFilters(filters: DataTableFilter[]): ContactTableFilters {
  const searchFilter = filters.find(
    (filter) => filter.type === "text" && filter.filterId === "search" && filter.operator === "CONTAINS",
  );
  const contactGroupFilter = filters.find(
    (filter) => filter.type === "containment" && filter.filterId === "contactGroup" && filter.operator === "IN",
  );
  const birthdayFilter = filters.find(
    (filter) =>
      filter.type === "comparison" && filter.filterId === "birthdayAfter" && filter.operator === "GREATER_OR_EQUAL",
  );
  const emailFilter = filters.find(
    (filter) => filter.type === "text" && filter.filterId === "emailContains" && filter.operator === "CONTAINS",
  );

  return {
    birthdayAfter:
      birthdayFilter?.type === "comparison" && typeof birthdayFilter.value !== "undefined"
        ? String(birthdayFilter.value)
        : "",
    contactGroupIds: contactGroupFilter?.type === "containment" ? contactGroupFilter.value : [],
    emailContains: emailFilter?.type === "text" && emailFilter.value ? emailFilter.value : "",
    search: searchFilter?.type === "text" && searchFilter.value ? searchFilter.value : "",
  };
}

function createContactGroupFilterSnippet() {
  return createRawSnippet<[FilterDefinitionSnippetProps]>((getSnippetProps) => ({
    render: () => "<div></div>",
    setup(element) {
      const component = mount(ContactGroupFilterControl, {
        target: element,
        props: {
          getSnippetProps,
          onOptionsLoaded: rememberContactGroupOptions,
        },
      });

      return () => {
        void unmount(component);
      };
    },
  }));
}

function rememberContactGroupOptions(options: MultiComboboxOption[]): void {
  options.forEach((option) => {
    contactGroupDisplayById.set(option.value, option.display);
  });
}
