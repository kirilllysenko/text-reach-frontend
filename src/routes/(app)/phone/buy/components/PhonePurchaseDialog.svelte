<script lang="ts">
  import { Button, ResponsiveDialog } from "$lib";
  import { formatPhoneNumber, phoneTypeLabels } from "$lib/feature/phone/phone-display";
  import type { AvailablePhone } from "./phone-buy-types";

  interface Props {
    buying: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    phone: AvailablePhone | null;
  }

  let { buying, onClose, onConfirm, phone }: Props = $props();

  function close(): void {
    if (!buying) {
      onClose();
    }
  }
</script>

<ResponsiveDialog
  open={phone !== null}
  title="Confirm phone purchase"
  description="The phone-number purchase price will be charged to your available balance."
  onClose={close}
>
  {#if phone}
    <div class="rounded-xl border border-white/80 bg-white/80 p-4">
      <p class="text-xl font-semibold text-slate-800">{formatPhoneNumber(phone.phoneNumber)}</p>
      <p class="mt-1 text-sm text-slate-500">{phoneTypeLabels[phone.phoneType]}</p>
    </div>

    <div class="mt-5 flex justify-end gap-2">
      <Button variant="secondary" disabled={buying} onclick={onClose}>Cancel</Button>
      <Button id="phone-buy-confirm" spinner={buying} onclick={() => void onConfirm()}>Confirm purchase</Button>
    </div>
  {/if}
</ResponsiveDialog>
