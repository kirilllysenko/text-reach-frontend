<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { ButtonEye, Input } from "$lib";

  interface Props extends Omit<HTMLInputAttributes, "type"> {
    error: string | null;
  }

  let { value = $bindable(), error, ...inputProps }: Props = $props();
  let maskPassword = $state(true);
</script>

<Input {...inputProps} type={maskPassword ? "password" : "text"} bind:value {error}>
  {#snippet rightAddon()}
    <ButtonEye
      off={!maskPassword}
      onclick={() => (maskPassword = !maskPassword)}
      class="mr-3"
      aria-label={maskPassword ? "Show password" : "Hide password"}
    />
  {/snippet}
</Input>
