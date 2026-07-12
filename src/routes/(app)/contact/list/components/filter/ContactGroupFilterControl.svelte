<script lang="ts">
  import { MultiCombobox, type FilterDefinitionSnippetProps, type MultiComboboxOption } from "$lib";
  import { loadContactGroupComboboxOptions } from "$lib/feature/contact-group/contact-group-combobox";

  interface Props {
    getSnippetProps: () => FilterDefinitionSnippetProps;
    onOptionsLoaded: (items: MultiComboboxOption[]) => void;
  }

  let { getSnippetProps, onOptionsLoaded }: Props = $props();

  const value = $derived(toValueList(getSnippetProps().getValue()));

  function toValueList(value: FilterDefinitionSnippetProps["value"]): string[] {
    return Array.isArray(value) ? value : [];
  }
</script>

<MultiCombobox
  {value}
  loadOptions={loadContactGroupComboboxOptions}
  placeholder="Search groups"
  emptyText="No groups found"
  loadingText="Loading groups..."
  onChange={(values) => getSnippetProps().setValue(values)}
  {onOptionsLoaded}
/>
