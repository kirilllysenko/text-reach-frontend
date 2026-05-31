<script lang="ts">
  import { FilterPanel, Input } from "$lib";
  import type { ContactGroupDto } from "$lib/api/index.schemas";

  interface Props {
    activeFilterChips: string[];
    contactGroups: ContactGroupDto[];
    selectedContactGroupIds: string[];
    contactGroupNameById: Record<string, string>;
    birthdayAfter: string;
    emailContains: string;
    compact?: boolean;
    onToggleContactGroup: (groupId: string) => void;
    onBirthdayAfterInput: (value: string) => void;
    onEmailContainsInput: (value: string) => void;
    onClear: () => void;
  }

  let {
    activeFilterChips,
    contactGroups,
    selectedContactGroupIds,
    contactGroupNameById,
    birthdayAfter,
    emailContains,
    compact = false,
    onToggleContactGroup,
    onBirthdayAfterInput,
    onEmailContainsInput,
    onClear,
  }: Props = $props();

  const groupOptions = $derived.by(() => {
    if (contactGroups.length > 0) {
      return contactGroups;
    }

    return Object.entries(contactGroupNameById).map(([id, name]) => ({
      id,
      name,
      contactCount: 0,
    }));
  });
</script>

<FilterPanel {activeFilterChips} title="Active filters" description="Refine the contact table" {compact} {onClear}>
  <div class="space-y-2">
    <p class="text-xs font-medium tracking-[0.02em] text-slate-500 uppercase">Groups</p>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {#each groupOptions as group (group.id)}
        <label
          class="flex items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-sm text-slate-700"
        >
          <input
            type="checkbox"
            checked={selectedContactGroupIds.includes(group.id)}
            onchange={() => onToggleContactGroup(group.id)}
          />
          <span class="min-w-0 truncate">{group.name}</span>
        </label>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <label class="space-y-1">
      <span class="text-xs font-medium text-slate-500">Birthday after</span>
      <Input type="date" value={birthdayAfter} oninput={(event) => onBirthdayAfterInput(event.currentTarget.value)} />
    </label>

    <label class="space-y-1">
      <span class="text-xs font-medium text-slate-500">Email contains</span>
      <Input
        type="search"
        value={emailContains}
        placeholder="name@example.com"
        oninput={(event) => onEmailContainsInput(event.currentTarget.value)}
      />
    </label>
  </div>
</FilterPanel>
