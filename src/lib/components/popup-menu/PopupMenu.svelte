<script lang="ts" generics="T">
  import type { Component } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface MenuItem<T> {
    icon?: Component<{ class?: string }>;
    text: string;
    clickHandler: (data?: T) => void;
  }

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    items: MenuItem<T>[];
    dataProvider?: () => T;
    class?: string;
  }

  let { class: classProp, items, dataProvider, ...divProps }: Props = $props();

  function itemClick(item: MenuItem<T>): void {
    item.clickHandler(dataProvider?.());
  }
</script>

<div
  {...divProps}
  class={[
    `bg-white/90 backdrop-blur-md border border-white/80
      rounded-xl shadow-lg select-none p-2`,
    classProp
  ]}
>
  {#each items as item (item.text)}
    {@const Icon = item.icon}
    <button
      class={
        `flex items-center gap-2 w-full p-2 rounded-lg
        hover:bg-white hover:cursor-pointer group text-slate-700`
      }
      onclick={() => itemClick(item)}
      tabindex="-1"
      type="button"
    >
      {#if Icon}
        <Icon class="size-4.5 fill-slate-500 group-hover:fill-slate-700" />
      {/if}
      {item.text}
    </button>
  {/each}
</div>
