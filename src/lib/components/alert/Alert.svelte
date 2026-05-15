<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type AlertType = "error" | "success" | "warning" | "info";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
    type: AlertType;
    class?: string;
    children?: Snippet;
  }

  let { type, children, ...divProps }: Props = $props();
</script>

<div
  data-type={type}
  class={[
    `mt-10 mb-5 rounded-xl border p-2 text-center shadow-sm sm:mx-auto sm:w-md`,
    type === "error" && "text-rose-800 border-rose-200/80 bg-rose-100/90",
    type === "success" && "text-emerald-800 border-emerald-200/80 bg-emerald-100/90",
    type === "warning" && "text-rose-800 border-rose-200/80 bg-rose-100/90",
    divProps.class,
  ]}
  {...divProps}
>
  {@render children?.()}
</div>
