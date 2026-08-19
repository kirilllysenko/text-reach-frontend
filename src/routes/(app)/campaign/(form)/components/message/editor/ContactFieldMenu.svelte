<script lang="ts">
  import { contactFieldOptions, type ContactFieldOption } from "../message";

  interface Props {
    onSelect: (field: ContactFieldOption) => void;
  }

  let { onSelect }: Props = $props();
</script>

<div
  class="absolute top-full left-0 z-30 mt-1 min-w-48 overflow-hidden rounded-xl border border-white/80 bg-white/95 p-1 shadow-xl backdrop-blur-md"
>
  {#each contactFieldOptions as field (field.key)}
    <button
      type="button"
      class="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:cursor-pointer hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-500"
      onclick={() => onSelect(field)}
    >
      {field.label}
    </button>
  {/each}
</div>
