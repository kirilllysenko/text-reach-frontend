<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type AlertType = "error" | "success" | "warning" | "info";
  type AlertLayout = "page" | "inline";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    type: AlertType;
    layout?: AlertLayout;
  }

  let { type, layout = "page", children, class: propClass, ...divProps }: Props = $props();
</script>

<div
  {...divProps}
  data-type={type}
  class={[
    `rounded-xl border shadow-sm`,
    layout === "page" && "mt-10 mb-5 p-2 text-center sm:mx-auto sm:w-md",
    layout === "inline" && "px-3 py-2 text-sm",
    type === "error" && "text-rose-800 border-rose-200/80 bg-rose-100/90",
    type === "success" && "text-emerald-800 border-emerald-200/80 bg-emerald-100/90",
    type === "warning" && "text-amber-900 border-amber-200/80 bg-amber-100/90",
    type === "info" && "text-sky-800 border-sky-200/80 bg-sky-100/90",
    propClass,
  ]}
>
  {@render children?.()}
</div>
