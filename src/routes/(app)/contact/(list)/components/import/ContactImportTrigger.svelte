<script lang="ts">
  import { Button } from "$lib";
  import Upload from "$lib/icons/Upload.svelte";

  interface Props {
    open: boolean;
    onOpen: () => void;
  }

  let { open, onOpen }: Props = $props();
</script>

<Button variant="secondary" small icon={Upload} active={open} onclick={onOpen}>
  <span class="hidden sm:inline">Import</span>
</Button>
