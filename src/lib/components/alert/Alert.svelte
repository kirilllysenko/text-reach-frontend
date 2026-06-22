<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type AlertType = "error" | "success" | "warning" | "info";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    type: AlertType;
  }

  let { type, children, class: propClass, ...divProps }: Props = $props();
</script>

<div
  {...divProps}
  data-type={type}
  class={[
    `mt-10 mb-5 rounded-xl border p-2 text-center shadow-sm sm:mx-auto sm:w-md`,
    type === "error" && "text-rose-800 border-rose-200/80 bg-rose-100/90",
    type === "success" && "text-emerald-800 border-emerald-200/80 bg-emerald-100/90",
    type === "warning" && "text-rose-800 border-rose-200/80 bg-rose-100/90",
    propClass,
  ]}
>
  {@render children?.()}
</div>
