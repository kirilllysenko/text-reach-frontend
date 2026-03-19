<script lang="ts">
  import type { Component, Snippet } from 'svelte';
  import type { ClassValue, HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    secondary?: boolean;
    small?: boolean;
    submit?: boolean;
    spinner?: boolean;
    disabled?: boolean;
    icon?: Component<{ class?: ClassValue }>;
    children?: Snippet;
  }

  let {
    class: classProp,
    secondary = false,
    small = false,
    submit = false,
    spinner = false,
    disabled = false,
    icon,
    children,
    ...buttonProps
  }: Props = $props();
</script>

<button
  {...buttonProps}
  type={submit ? 'submit' : 'button'}
  disabled={spinner || disabled}
  class={[
    `flex gap-1 justify-center items-center rounded-xl border font-medium
      transition-[transform,box-shadow,background-color] duration-200 ease-out
      focus-visible:outline-2 focus-visible:outline-sky-500
      hover:not-disabled:cursor-pointer active:not-disabled:scale-99`,
    small ? 'text-sm h-7 pl-1 pr-1' : 'text-base h-9 pl-3 pr-3',
    disabled && !spinner
      ? 'border-white/70 bg-white/60 text-slate-400'
      : secondary
        ? `border-white/80 bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm
           hover:not-disabled:bg-white`
        : `border-slate-700 bg-slate-700 text-white shadow-sm
           hover:not-disabled:bg-slate-800 hover:not-disabled:-translate-y-0.5
           hover:not-disabled:shadow-[0_12px_24px_-12px_rgba(15,23,42,0.65),0_6px_9px_-6px_rgba(15,23,42,0.45)]
           focus-visible:outline-offset-2`,
    classProp
  ]}
>
  {#if icon}
    {@const Icon = icon}
    <Icon class={[small ? 'size-4' : 'size-5', secondary ? 'fill-slate-700' : 'fill-white']} />
  {/if}

  <div class="text-nowrap">
    {@render children?.()}
  </div>

  {#if spinner}
    <svg
      class={['ml-1 animate-spin fill-none stroke-slate-500', small ? 'size-4' : 'size-5']}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-20" cx="12" cy="12" r="9" stroke-width="3" />
      <path class="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke-width="3" stroke-linecap="round" />
    </svg>
  {/if}
</button>
