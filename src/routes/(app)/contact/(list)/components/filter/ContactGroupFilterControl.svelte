<script lang="ts">
  import { type DataTableContainmentFilterComponentProps } from "$lib";
  import type { FormValue } from "text-reach-frontend-library/form";
  import ContactGroupMultiCombobox from "$lib/feature/contact-group/MultiCombobox/ContactGroupMultiCombobox.svelte";

  let { id, value, setValue }: DataTableContainmentFilterComponentProps = $props();

  const field: FormValue<string[]> = {
    get value() {
      return value ?? [];
    },
    set value(values) {
      setValue(values);
    },
    error: null,
  };
</script>

<ContactGroupMultiCombobox
  {id}
  {field}
  placeholder="Search groups"
  emptyText="No groups found"
  loadingText="Loading groups..."
/>
