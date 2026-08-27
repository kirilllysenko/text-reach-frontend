<script lang="ts">
  import type { PhoneType$options } from "$houdini/graphql/enums";
  import { Button, Card } from "$lib";
  import { phoneTypeLabels } from "$lib/feature/phone/phone-display";

  interface Props {
    disabled: boolean;
    onSelect: (phoneType: PhoneType$options) => Promise<void> | void;
    selectedType: PhoneType$options;
  }

  let { disabled, onSelect, selectedType }: Props = $props();

  const phoneTypeOptions: PhoneType$options[] = ["TOLL_FREE", "TEN_DLC", "SHORT_CODE"];
</script>

<Card variant="panel" class="p-4">
  <p class="text-xs font-semibold tracking-[0.06em] text-slate-500 uppercase">Step 2</p>
  <h2 class="mt-1 text-base font-semibold text-slate-800">Choose number type</h2>
  <div class="mt-3 grid gap-2">
    {#each phoneTypeOptions as phoneType (phoneType)}
      <Button
        id={`phone-type-${phoneType.toLowerCase().replace("_", "-")}`}
        variant="secondary"
        active={selectedType === phoneType}
        class="h-11 justify-start px-3"
        {disabled}
        onclick={() => void onSelect(phoneType)}
      >
        {phoneTypeLabels[phoneType]}
      </Button>
    {/each}
  </div>
</Card>
