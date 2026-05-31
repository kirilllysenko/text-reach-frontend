<script lang="ts">
  import { ResponsiveDialog } from "$lib";
  import ContactFilterPanel from "./ContactFilterPanel.svelte";
  import ContactSortPanel from "./ContactSortPanel.svelte";
  import type { ContactsState } from "$lib/features/contacts/contacts-state.svelte";

  interface Props {
    state: ContactsState;
  }

  let { state }: Props = $props();
</script>

<ResponsiveDialog
  open={state.filtersOpen}
  title="Filter contacts"
  description="Refine the contact table without taking over the whole page."
  onClose={state.closeOverlays}
>
  <ContactFilterPanel
    activeFilterChips={state.activeFilterChips}
    contactGroups={state.contactGroups}
    selectedContactGroupIds={state.selectedContactGroupIds}
    contactGroupNameById={state.contactGroupNameById}
    birthdayAfter={state.birthdayAfter}
    emailContains={state.emailContains}
    compact
    onToggleContactGroup={state.toggleContactGroupFilter}
    onBirthdayAfterInput={state.updateBirthdayAfter}
    onEmailContainsInput={state.updateEmailContains}
    onClear={state.clearFilters}
  />

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
  <ContactSortPanel
    sortRules={state.sortRules}
    sortFieldOptions={state.sortFieldOptions}
    sortChips={state.sortChips}
    compact
    onAddRule={state.addSortRule}
    onRemoveRule={state.removeSortRule}
    onFieldChange={state.updateSortRuleField}
    onDirectionChange={state.updateSortRuleDirection}
    onReset={state.clearSortRules}
  />

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
