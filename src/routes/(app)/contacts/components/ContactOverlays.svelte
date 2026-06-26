<script lang="ts">
  import {
    FilterPanel,
    ResponsiveDialog,
    SortPanel,
    createFilterController,
    createSortController,
    type FilterPanelConfig,
  } from "$lib";
  import type { ContactsState } from "$lib/features/contacts/contacts-state.svelte";
  import { contactSortFieldLabelMap } from "$lib/features/contacts/contacts-view-data";

  interface Props {
    filtering: ReturnType<typeof createFilterController>;
    sorting: ReturnType<typeof createSortController>;
    state: ContactsState;
  }

  let { filtering: filterController, sorting, state }: Props = $props();

  const contactGroupOptions = $derived.by(() => {
    if (state.contactGroups.length > 0) {
      return state.contactGroups.map((group) => ({
        value: group.id,
        label: group.name,
      }));
    }

    return Object.entries(state.contactGroupNameById).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  });

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
        options: contactGroupOptions,
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
    state.sortFieldOptions.map((field) => ({
      value: field,
      label: contactSortFieldLabelMap[field],
    })),
  );
</script>

<ResponsiveDialog
  open={state.filtersOpen}
  title="Filter contacts"
  description="Refine the contact table without taking over the whole page."
  onClose={state.closeOverlays}
>
  <FilterPanel filtering={filterController} config={filtering} compact />

  {#snippet mobileFooter()}
    <button
      class="h-10 w-full rounded-xl bg-slate-700 text-sm font-medium text-white shadow-sm
        hover:cursor-pointer hover:bg-slate-800"
      type="button"
      onclick={state.closeOverlays}
    >
      Apply filters
    </button>
  {/snippet}
</ResponsiveDialog>

<ResponsiveDialog
  open={state.sortOpen}
  title="Sort contacts"
  description="Adjust the priority stack for the contact table."
  onClose={state.closeOverlays}
>
  <SortPanel {sorting} fieldOptions={sortFieldOptions} compact />

  {#snippet mobileFooter()}
    <button
      class="h-10 w-full rounded-xl bg-slate-700 text-sm font-medium text-white shadow-sm
        hover:cursor-pointer hover:bg-slate-800"
      type="button"
      onclick={state.closeOverlays}
    >
      Apply sorting
    </button>
  {/snippet}
</ResponsiveDialog>
