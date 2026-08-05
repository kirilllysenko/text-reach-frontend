<script lang="ts">
  import type { ContactForm } from "./form.svelte";

  interface ContactGroupOption {
    id: string;
    name: string;
  }

  interface Props {
    form: ContactForm;
    groups: ContactGroupOption[];
    onToggle: (groupId: string) => void;
  }

  let { form, groups, onToggle }: Props = $props();
</script>

<section class="mt-5 space-y-2">
  <h2 class="text-sm font-medium text-slate-700">Groups</h2>

  {#if groups.length > 0}
    <div class="grid gap-2 sm:grid-cols-2">
      {#each groups as group (group.id)}
        <label
          class="flex min-h-10 items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3
            py-2 text-sm text-slate-700 shadow-sm"
        >
          <input
            type="checkbox"
            class="size-4 accent-slate-700"
            checked={form.contactGroupIds.value.includes(group.id)}
            onchange={() => onToggle(group.id)}
          />
          <span>{group.name}</span>
        </label>
      {/each}
    </div>
  {:else}
    <p class="rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-sm text-slate-500 shadow-sm">
      No groups available
    </p>
  {/if}
</section>
