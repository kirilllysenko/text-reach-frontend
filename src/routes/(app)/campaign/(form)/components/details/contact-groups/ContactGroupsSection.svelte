<script lang="ts">
  import { onMount } from "svelte";
  import { CampaignFormContactGroupsStore } from "$houdini";
  import { Button, FieldError } from "$lib";
  import Close from "text-reach-frontend-library/icons/Close.svelte";
  import Plus from "text-reach-frontend-library/icons/Plus.svelte";

  interface Props {
    error?: string | null;
    value?: string[];
  }

  const contactGroupsQuery = new CampaignFormContactGroupsStore();
  let { error = null, value = $bindable<string[]>([]) }: Props = $props();

  const groups = $derived($contactGroupsQuery.data?.contactGroups.edges.map((edge) => edge.node) ?? []);
  const selectedGroups = $derived(value.flatMap((id) => groups.find((group) => group.id === id) ?? []));
  const nextGroup = $derived(groups.find((group) => !value.includes(group.id)));
  const allGroupsAdded = $derived(groups.length > 0 && selectedGroups.length === groups.length);
  const loadFailed = $derived(Boolean($contactGroupsQuery.errors));

  onMount(() => {
    void contactGroupsQuery.fetch();
  });

  function addNextGroup(): void {
    if (!nextGroup) return;
    value = [...value, nextGroup.id];
  }

  function removeGroup(id: string): void {
    value = value.filter((groupId) => groupId !== id);
  }
</script>

<section class="mt-5" aria-labelledby="campaign-contact-groups-title" aria-busy={$contactGroupsQuery.fetching}>
  <div class="mb-2 flex items-center justify-between gap-3">
    <h2 id="campaign-contact-groups-title" class="text-sm font-medium text-slate-700">
      Contact groups<span class="text-rose-500">*</span>
    </h2>
    <p class="text-xs text-slate-500">{selectedGroups.length} of {groups.length} groups added</p>
  </div>

  {#if $contactGroupsQuery.fetching && groups.length === 0}
    <div class="space-y-2" aria-hidden="true">
      <div class="skeleton-loading h-10 rounded-xl"></div>
      <div class="skeleton-loading h-10 rounded-xl"></div>
    </div>
  {:else}
    <div class="space-y-2">
      {#each selectedGroups as group (group.id)}
        <div
          class="flex min-h-10 items-center gap-3 rounded-xl border border-white/80 bg-white/75 px-3 shadow-sm"
          data-testid="campaign-contact-group"
          data-contact-group-id={group.id}
        >
          <span class="min-w-0 grow truncate text-sm font-medium text-slate-700">{group.name}</span>
          <span class="shrink-0 text-sm text-slate-500">
            {group.contactCount.toLocaleString()}
            {group.contactCount === 1 ? "contact" : "contacts"}
          </span>
          <button
            type="button"
            class="rounded-lg p-1 hover:cursor-pointer hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-500"
            aria-label={`Remove ${group.name}`}
            onclick={() => removeGroup(group.id)}
          >
            <Close class="size-4 fill-slate-500" />
          </button>
        </div>
      {/each}

      <Button
        id="campaign-contact-group-add"
        variant="secondary"
        icon={Plus}
        class="w-full border-dashed"
        disabled={$contactGroupsQuery.fetching || loadFailed || !nextGroup}
        onclick={addNextGroup}
      >
        Add contact group
      </Button>
    </div>

    <p class="mt-1 text-xs text-slate-500">
      {allGroupsAdded ? "All available groups have been added" : "Adds the next available group"}
    </p>
  {/if}

  {#if loadFailed}
    <div class="mt-2 flex flex-wrap items-center gap-2">
      <FieldError error="There was an error loading contact groups." />
      <Button small variant="secondary" onclick={() => contactGroupsQuery.fetch()}>Try again</Button>
    </div>
  {/if}

  <FieldError class="mt-2" {error} />
</section>
