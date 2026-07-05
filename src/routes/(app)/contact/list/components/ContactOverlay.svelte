<script lang="ts">
  import {
    Button,
    FilterPanel,
    ResponsiveDialog,
    SortPanel,
    createFilterController,
    createSortController,
    type FilterPanelConfig,
  } from "$lib";
  import { contactSortFieldLabelMap, type ContactSortField } from "$lib/feature/contact/contact-view-data";
  import type { ContactGroupOption } from "./contact-group-lookup-state.svelte";

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
    <Button class="w-full" onclick={onClose}>Apply filters</Button>
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
    <Button class="w-full" onclick={onClose}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
