<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import AlertTriangle from "$lib/icons/AlertTriangle.svelte";
  import Check from "$lib/icons/Check.svelte";
  import Close from "$lib/icons/Close.svelte";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    type?: "info" | "error";
    timeLeftPercent?: number;
    onClose?: () => void;
  }

  let { type = "info", timeLeftPercent = 0, onClose, children, class: propClass, ...divProps }: Props = $props();
</script>

<div
  {...divProps}
  class={[
    `group relative border-white/80 bg-white/90 p-3
      shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.1)] backdrop-blur-md sm:rounded-xl
      sm:border
      sm:pt-5 sm:pr-5 sm:pl-5 sm:shadow-md`,
    propClass,
  ]}
>
  <div class="flex items-center gap-2 overflow-hidden sm:gap-3">
    {#if type === "info"}
      <Check class="size-7 fill-emerald-600" />
    {:else if type === "error"}
      <AlertTriangle class="size-7 fill-rose-600" />
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
    <Close class="size-4 fill-slate-500" />
  </button>
</div>
