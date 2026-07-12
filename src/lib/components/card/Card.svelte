<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    variant?: "auth" | "panel" | "table";
  }

  let { children, class: propClass, variant = "auth", ...divProps }: Props = $props();
</script>

<div
  {...divProps}
  class={[
    `rounded-2xl border shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md`,
    variant === "auth" && `mt-10 border-white/80 bg-white/75 p-4 sm:mx-auto sm:w-md sm:p-6`,
    variant !== "auth" && `border-white/70 bg-white/70`,
    variant === "panel" && `p-3`,
    variant === "table" && `flex min-h-0 grow flex-col overflow-hidden p-0`,
    propClass,
  ]}
>
  {@render children?.()}
</div>
