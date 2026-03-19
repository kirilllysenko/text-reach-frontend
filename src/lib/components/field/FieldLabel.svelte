<script lang="ts">
  import type {HTMLLabelAttributes} from 'svelte/elements';

  interface Props extends HTMLLabelAttributes {
  }

  let {children, ...labelProps}: Props = $props();
</script>

<label
      {...labelProps}
      class={[
            'block text-sm font-medium text-slate-700',
            labelProps.class
      ]}>
  {@render children?.()}
</label>
