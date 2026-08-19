<script lang="ts">
  import { Button, FilterPanel, ResponsiveDialog, type FilteringService, type FilterPanelConfig } from "$lib";
  import { userRoleLabelMap, userRoleOptions } from "$lib/feature/user/user-view-data";
  import Filter from "text-reach-frontend-library/icons/Filter.svelte";

  interface Props {
    filtering: FilteringService;
  }

  let { filtering }: Props = $props();
  let open = $state(false);

  const config: FilterPanelConfig = {
    title: "Active filters",
    description: "Refine the users table",
    fields: [
      {
        kind: "checkbox-group",
        id: "role",
        label: "Role",
        filterId: "role",
        operator: "IN",
        options: userRoleOptions.map((role) => ({
          value: role,
          label: userRoleLabelMap[role],
        })),
      },
    ],
  };
</script>

<Button variant="secondary" active={open} icon={Filter} class="relative gap-2 text-sm" onclick={() => (open = true)}>
  <span class="flex items-center gap-2">
    Filters
    <span
      class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
        leading-4 text-white"
    >
      {filtering.getVisibleActiveFilterCount()}
    </span>
  </span>
</Button>

<ResponsiveDialog
  {open}
  title="Filter users"
  description="Refine the users table without taking over the whole page."
  onClose={() => (open = false)}
>
  <FilterPanel {filtering} {config} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={() => (open = false)}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>
