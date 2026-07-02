<script lang="ts" generics="T">
  import type { DropdownOption } from "./dropdown-types";

  interface Props {
    id: string;
    options: DropdownOption<T>[];
    value?: DropdownOption<T>;
    maxHeight: string;
    emptyText?: string;
    popup?: HTMLDivElement | null;
    onFocusOut: (event: FocusEvent) => void;
    onOptionFocusIn: (optionButton: HTMLButtonElement) => void;
    onOptionKeyDown: (event: KeyboardEvent, option: DropdownOption<T>) => void;
    onSelect: (option: DropdownOption<T>) => void;
  }

  let {
    id,
    options,
    value,
    maxHeight,
    emptyText = "No options found",
    popup = $bindable<HTMLDivElement | null>(),
    onFocusOut,
    onOptionFocusIn,
    onOptionKeyDown,
    onSelect,
  }: Props = $props();
</script>

<div
  {id}
  bind:this={popup}
  style:max-height={maxHeight}
  class={`absolute z-10 mt-px w-full min-w-50 overflow-y-scroll rounded-xl border
    border-white/80 bg-white/95 p-2 shadow-lg backdrop-blur-sm select-none`}
  onfocusout={onFocusOut}
  role="listbox"
>
  {#each options as option (option.id)}
    <button
      data-option
      class={`flex w-full items-center rounded-lg px-2 py-1 text-slate-700 hover:cursor-pointer
        hover:bg-white focus-visible:outline-2 focus-visible:outline-sky-500`}
      tabindex="0"
      type="button"
      onclick={() => onSelect(option)}
      onfocusin={(event) => onOptionFocusIn(event.currentTarget as HTMLButtonElement)}
      onkeydown={(event) => onOptionKeyDown(event, option)}
      role="option"
      aria-selected={option.id === value?.id}
    >
      <span class="grow text-left">{option.value}</span>
      {#if option.id === value?.id}
        <svg class="size-4 fill-slate-600" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8.6-8.6 1.4 1.4z" />
        </svg>
      {/if}
    </button>
  {:else}
    <div class="px-2 py-1 text-sm text-slate-500">{emptyText}</div>
  {/each}
</div>
