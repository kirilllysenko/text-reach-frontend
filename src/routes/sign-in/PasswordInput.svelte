<script lang="ts">
  import type {HTMLInputAttributes} from 'svelte/elements';
  import {Button, Input} from "$lib";

  interface Props extends Omit<HTMLInputAttributes, 'type'> {
    error?: string | null;
  }

  let {value = $bindable(), error, ...inputProps}: Props = $props();
  let maskPassword = $state(true);
</script>

<Input
      {...inputProps}
      type={maskPassword ? 'password' : 'text'}
      bind:value={value}
/>
<Button
      onclick={() => (maskPassword = !maskPassword)}
      class={[
                `absolute right-1 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm
                text-slate-600 hover:bg-slate-100`
              ]}
>
  {maskPassword ? 'Show' : 'Hide'}
</Button>