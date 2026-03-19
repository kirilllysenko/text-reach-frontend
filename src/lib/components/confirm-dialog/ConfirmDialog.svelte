<script lang="ts">
  import Dialog from '../dialog/Dialog.svelte';
  import Button from '../button/Button.svelte';

  interface Props {
    question: string;
    cannotBeCanceledWarning?: boolean;
    confirmHandler?: () => Promise<void> | void;
    onResolve?: (confirmed: boolean) => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
  }

  let {
    question,
    cannotBeCanceledWarning = false,
    confirmHandler,
    onResolve,
    onConfirm,
    onCancel,
    onError
  }: Props = $props();

  let processing = $state(false);

  async function yesClick(): Promise<void> {
    if (processing) return;

    processing = true;
    try {
      await confirmHandler?.();
      onConfirm?.();
      onResolve?.(true);
    } catch (error: unknown) {
      onError?.(error);
    } finally {
      processing = false;
    }
  }

  function noClick(): void {
    if (processing) return;
    onCancel?.();
    onResolve?.(false);
  }
</script>

<div inert={processing || undefined}>
  <Dialog>
    {#if cannotBeCanceledWarning}
      <p class="bg-amber-100/90 border border-amber-200/80 text-amber-800 p-2 rounded-xl w-full mb-5">
        Attention! This action cannot be canceled.
      </p>
    {/if}

    <p>
      {question}
    </p>

    <div class="mt-5 flex justify-end gap-3">
      <Button spinner={processing} onclick={yesClick}>Yes</Button>
      <Button secondary onclick={noClick} disabled={processing}>No</Button>
    </div>
  </Dialog>
</div>
