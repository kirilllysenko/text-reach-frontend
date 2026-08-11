<script lang="ts">
  import { type DataTableContainmentFilterComponentProps } from "$lib";
  import ContactGroupCombobox from "$lib/feature/contact-group/ContactGroupCombobox.svelte";

  let { value, setValue }: DataTableContainmentFilterComponentProps = $props();
</script>

<ContactGroupCombobox
  value={value ?? []}
  placeholder="Search groups"
  emptyText="No groups found"
  loadingText="Loading groups..."
  onChange={(values) => setValue(values)}
/>
