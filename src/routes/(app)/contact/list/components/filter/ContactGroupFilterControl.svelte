<script lang="ts">
  import { MultiCombobox, type DataTableContainmentFilterComponentProps } from "$lib";
  import { loadContactGroupComboboxOptions } from "$lib/feature/contact-group/contact-group-combobox";

  let { value, setValue }: DataTableContainmentFilterComponentProps = $props();
</script>

<MultiCombobox
  value={value ?? []}
  loadOptions={loadContactGroupComboboxOptions}
  placeholder="Search groups"
  emptyText="No groups found"
  loadingText="Loading groups..."
  onChange={(values) => setValue(values)}
/>
