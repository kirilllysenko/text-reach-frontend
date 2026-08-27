<script lang="ts">
  import { Button } from "$lib";
  import { formatPhoneNumber, phoneTypeLabels } from "$lib/feature/phone/phone-display";
  import type { AvailablePhone } from "./phone-buy-types";

  interface Props {
    availablePhones: AvailablePhone[];
    businessProfileReady: boolean;
    onChoose: (phone: AvailablePhone) => void;
    searchError: string | null;
    searching: boolean;
  }

  let { availablePhones, businessProfileReady, onChoose, searchError, searching }: Props = $props();
</script>

{#if searching}
  <div class="mt-4 grid gap-3 sm:grid-cols-2">
    {#each Array(6) as _, index (index)}
      <div class="skeleton-loading h-20 rounded-2xl"></div>
    {/each}
  </div>
{:else if businessProfileReady && !searchError && availablePhones.length === 0}
  <div class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/50 px-4 py-10 text-center">
    <p class="font-medium text-slate-700">No matching numbers</p>
    <p class="mt-1 text-sm text-slate-500">Try fewer digits or choose another number type.</p>
  </div>
{:else if availablePhones.length > 0}
  <div class="mt-4 grid gap-3 sm:grid-cols-2">
    {#each availablePhones as phone (phone.phoneNumber)}
      <article class="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm">
        <div class="min-w-0 grow">
          <p class="truncate font-semibold text-slate-800">{formatPhoneNumber(phone.phoneNumber)}</p>
          <p class="mt-1 text-xs text-slate-500">{phoneTypeLabels[phone.phoneType]}</p>
        </div>
        <Button id={`phone-buy-${phone.phoneNumber.replace(/\D/g, "")}`} small onclick={() => onChoose(phone)}>
          Buy
        </Button>
      </article>
    {/each}
  </div>
{/if}
