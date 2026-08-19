<script lang="ts">
  import { Button } from "$lib";
  interface Props {
    onDone: () => void;
    onHistory: () => void;
  }

  let { onDone, onHistory }: Props = $props();
</script>

<section class="space-y-4">
  <div class="bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 p-4 text-sm">
    Contact import has been queued.
  </div>

  <div class="flex justify-end gap-2">
    <Button variant="secondary" onclick={onDone}>Back to contacts</Button>
    <Button onclick={onHistory}>View import history</Button>
  </div>
</section>
