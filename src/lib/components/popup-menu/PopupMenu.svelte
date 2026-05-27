<script lang="ts" generics="T">
  import type { Component } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface MenuItem<T> {
    icon?: Component<{ class?: string }>;
    text: string;
    clickHandler: (data?: T) => void;
  }

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
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
    `rounded-xl border border-white/80 bg-white/90
      p-2 shadow-lg backdrop-blur-md select-none`,
    classProp,
  ]}
>
  {#each items as item (item.text)}
    {@const Icon = item.icon}
    <button
      class={`group flex w-full items-center gap-2 rounded-lg
        p-2 text-slate-700 hover:cursor-pointer hover:bg-white`}
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
