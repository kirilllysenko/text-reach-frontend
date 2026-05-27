<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
    class?: string;
    type?: "info" | "error";
    timeLeftPercent?: number;
    onClose?: () => void;
    children?: Snippet;
  }

  let { type = "info", timeLeftPercent = 0, onClose, children, ...divProps }: Props = $props();
</script>

<div
  {...divProps}
  class={[
    `group relative border-white/80 bg-white/90 p-3
      shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.1)] backdrop-blur-md sm:rounded-xl
      sm:border
      sm:pt-5 sm:pr-5 sm:pl-5 sm:shadow-md`,
    divProps.class,
  ]}
>
  <div class="flex items-center gap-2 overflow-hidden sm:gap-3">
    {#if type === "info"}
      <svg class="size-7 fill-emerald-600" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8.6-8.6 1.4 1.4z" />
      </svg>
    {:else if type === "error"}
      <svg class="size-7 fill-rose-600" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z" />
      </svg>
    {/if}

    {@render children?.()}
  </div>

  <div class="mt-2 h-0.5 duration-100 ease-linear sm:mt-3" style:width={`${timeLeftPercent}%`}>
    <div class="bg-sky-600/50 h-full w-full"></div>
  </div>

  <button
    class={`absolute top-1 right-1 rounded-sm p-1
      group-hover:block hover:cursor-pointer hover:bg-white sm:hidden`}
    onclick={() => onClose?.()}
    type="button"
    aria-label="Close notification"
  >
    <svg class="size-4 fill-slate-500" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m18.3 5.7-1-1L12 10l-5.3-5.3-1 1L11 11l-5.3 5.3 1 1L12 12l5.3 5.3 1-1L13 11z" />
    </svg>
  </button>
</div>
