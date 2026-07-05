<script lang="ts">
  import {
    FilterPanel,
    ResponsiveDialog,
    SortPanel,
    createFilterController,
    createSortController,
    type FilterPanelConfig,
  } from "$lib";
  import type { ContactGroupOption } from "$lib/feature/contact/contact-group-lookup-state.svelte";
  import { contactSortFieldLabelMap, type ContactSortField } from "$lib/feature/contact/contact-view-data";

  type OpenPanel = "filters" | "sort" | null;

  interface Props {
    filtering: ReturnType<typeof createFilterController>;
    groupOptions: ContactGroupOption[];
    onClose: () => void;
    openPanel: OpenPanel;
    sorting: ReturnType<typeof createSortController>;
    sortFieldOptions: ContactSortField[];
  }

  let {
    filtering: filterController,
    groupOptions,
    onClose,
    openPanel,
    sorting,
    sortFieldOptions: contactSortFieldOptions,
  }: Props = $props();

  const filtering = $derived.by<FilterPanelConfig>(() => ({
    title: "Active filters",
    description: "Refine the contact table",
    fields: [
      {
        kind: "checkbox-group",
        id: "groups",
        label: "Groups",
        filterId: "contactGroup",
        operator: "IN",
        options: groupOptions,
      },
      {
        kind: "input-grid",
        id: "contact-fields",
        columns: 2,
        inputs: [
          {
            kind: "input",
            id: "birthdayAfter",
            label: "Birthday after",
            filterId: "birthdayAfter",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "date",
          },
          {
            kind: "input",
            id: "emailContains",
            label: "Email contains",
            filterId: "emailContains",
            filterType: "text",
            operator: "CONTAINS",
            inputType: "search",
            placeholder: "name@example.com",
          },
        ],
      },
    ],
  }));

  const sortFieldOptions = $derived(
    contactSortFieldOptions.map((field) => ({
      value: field,
      label: contactSortFieldLabelMap[field],
    })),
  );
</script>

<ResponsiveDialog
  open={openPanel === "filters"}
  title="Filter contacts"
  description="Refine the contact table without taking over the whole page."
  {onClose}
>
  <FilterPanel filtering={filterController} config={filtering} compact />

  {#snippet mobileFooter()}
    <button
      class="h-10 w-full rounded-xl bg-slate-700 text-sm font-medium text-white shadow-sm
        hover:cursor-pointer hover:bg-slate-800"
      type="button"
      onclick={onClose}
    >
      Apply filters
    </button>
  {/snippet}
</ResponsiveDialog>

<ResponsiveDialog
  open={openPanel === "sort"}
  title="Sort contacts"
  description="Adjust the priority stack for the contact table."
  {onClose}
>
  <SortPanel {sorting} fieldOptions={sortFieldOptions} compact />

  {#snippet mobileFooter()}
    <button
      class="h-10 w-full rounded-xl bg-slate-700 text-sm font-medium text-white shadow-sm
        hover:cursor-pointer hover:bg-slate-800"
      type="button"
      onclick={onClose}
    >
      Apply sorting
    </button>
  {/snippet}
</ResponsiveDialog>
