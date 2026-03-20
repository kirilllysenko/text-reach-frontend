<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { ButtonEye, Input } from "$lib";

  interface Props extends Omit<HTMLInputAttributes, "type"> {
    error?: string | null;
  }

  let { value = $bindable(), error, ...inputProps }: Props = $props();
  let maskPassword = $state(true);
</script>

<div class="relative">
  <Input
    {...inputProps}
    type={maskPassword ? "password" : "text"}
    bind:value
    {error}
    class={["pr-10", inputProps.class]}
  />
  <ButtonEye
    off={!maskPassword}
    onclick={() => (maskPassword = !maskPassword)}
    class={["absolute top-1/2 right-3 -translate-y-1/2"]}
    aria-label={maskPassword ? "Show password" : "Hide password"}
  />
</div>
