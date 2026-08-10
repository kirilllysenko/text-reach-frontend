<script lang="ts">
  import { ContactGroupComboboxQueryStore } from "$houdini";
  import { MultiCombobox, type MultiComboboxOption } from "$lib/components";
  import { onDestroy, type ComponentProps } from "svelte";

  type MultiComboboxProps = ComponentProps<typeof MultiCombobox>;

  interface ContactGroupSummary {
    id: string;
    name: string;
  }

  interface Props extends Omit<MultiComboboxProps, "hasNextPage" | "onLoadNextPage" | "onSearch" | "options"> {}

  let { value = $bindable<string[]>([]), ...comboboxProps }: Props = $props();

  const contactGroupsQuery = new ContactGroupComboboxQueryStore();

  const options = $derived($contactGroupsQuery.data?.contactGroups.edges.map((edge) => toOption(edge.node)) ?? []);
  const hasNextPage = $derived($contactGroupsQuery.pageInfo.hasNextPage);

  async function search(searchValue: string): Promise<void> {
    const response = await contactGroupsQuery.fetch({
      variables: {
        after: null,
        before: null,
        filter: searchValue ? { name: { contains: searchValue } } : null,
        first: 50,
        last: null,
        sortBy: [{ name: { direction: "ASC" } }],
      },
    });

    if (response.errors) {
      throw new Error("Could not load contact groups.");
    }
  }

  async function loadNextPage(): Promise<void> {
    const response = await contactGroupsQuery.loadNextPage();

    if (response.errors) {
      throw new Error("Could not load more contact groups.");
    }
  }

  function toOption(group: ContactGroupSummary): MultiComboboxOption {
    return {
      value: group.id,
      display: group.name,
    };
  }
</script>

<MultiCombobox
  {...comboboxProps}
  bind:value
  {options}
  {hasNextPage}
  label="Groups"
  placeholder="Search groups"
  emptyText="No groups found"
  loadingText="Loading groups..."
  onSearch={search}
  onLoadNextPage={loadNextPage}
/>
