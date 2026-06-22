<script lang="ts">
  import Dialog from "../dialog/Dialog.svelte";
  import Button from "../button/Button.svelte";
  import type { MaybePromise } from "$lib/utils/async";

  interface Props {
    question: string;
    onConfirm?: () => MaybePromise<void>;
    onCancel?: () => Promise<void>;
  }

  let { question, onConfirm, onCancel }: Props = $props();

  let processing = $state(false);

  async function confirm() {
    if (processing) return;

    processing = true;
    try {
      await onConfirm?.();
    } finally {
      processing = false;
    }
  }

  async function cancel() {
    if (processing) return;

    processing = true;
    try {
      await onCancel?.();
    } finally {
      processing = false;
    }
  }
</script>

<div inert={processing || undefined}>
  <Dialog>
    <p>
      {question}
    </p>

    <div class="mt-5 flex justify-end gap-3">
      <Button spinner={processing} onclick={confirm}>Yes</Button>
      <Button secondary onclick={cancel} disabled={processing}>No</Button>
    </div>
  </Dialog>
</div>
