<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    class?: string;
    type?: 'info' | 'error';
    timeLeftPercent?: number;
    onClose?: () => void;
    children?: Snippet;
  }

  let {
    type = 'info',
    timeLeftPercent = 0,
    onClose,
    children,
    ...divProps
  }: Props = $props();
</script>

<div
  {...divProps}
  class={[
    `relative group sm:rounded-xl bg-white/90 backdrop-blur-md
      sm:border border-white/80 p-3
      shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.1)]
      sm:shadow-md sm:pl-5 sm:pt-5 sm:pr-5`,
    divProps.class
  ]}
>
  <div class="flex items-center gap-2 overflow-hidden sm:gap-3">
    {#if type === 'info'}
      <svg class="fill-emerald-600 size-7" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8.6-8.6 1.4 1.4z" />
      </svg>
    {:else if type === 'error'}
      <svg class="fill-rose-600 size-7" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z" />
      </svg>
    {/if}

    {@render children?.()}
  </div>

  <div class="h-0.5 mt-2 sm:mt-3 duration-100 ease-linear" style:width={`${timeLeftPercent}%`}>
    <div class="w-full h-full bg-sky-600/50"></div>
  </div>

  <button
    class={
      `absolute sm:hidden group-hover:block top-1 right-1
      rounded-sm hover:bg-white hover:cursor-pointer p-1`
    }
    onclick={() => onClose?.()}
    type="button"
    aria-label="Close notification"
  >
    <svg class="size-4 fill-slate-500" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m18.3 5.7-1-1L12 10l-5.3-5.3-1 1L11 11l-5.3 5.3 1 1L12 12l5.3 5.3 1-1L13 11z" />
    </svg>
  </button>
</div>
