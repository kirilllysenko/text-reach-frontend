<script lang="ts">
  import { type DataTableContainmentFilterComponentProps } from "$lib";
  import ContactGroupMultiCombobox from "$lib/feature/contact-group/MultiCombobox/ContactGroupMultiCombobox.svelte";

  let { id, value, setValue }: DataTableContainmentFilterComponentProps = $props();
</script>

<ContactGroupMultiCombobox
  {id}
  value={value ?? []}
  placeholder="Search groups"
  emptyText="No groups found"
  loadingText="Loading groups..."
  onChange={(values) => setValue(values)}
/>
