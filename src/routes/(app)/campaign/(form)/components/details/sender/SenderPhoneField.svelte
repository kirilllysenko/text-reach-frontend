<script lang="ts">
  import { onMount } from "svelte";
  import { CampaignFormSenderPhonesStore } from "$houdini";
  import { Button, Field, FieldError, Select, type DropdownOption } from "$lib";
  import type { FormValue } from "text-reach-frontend-library/form";

  interface Props {
    field: FormValue<string>;
    phoneNumber?: string;
  }

  const senderPhonesQuery = new CampaignFormSenderPhonesStore();
  let { field = $bindable(), phoneNumber = $bindable("") }: Props = $props();

  const options = $derived(
    ($senderPhonesQuery.data?.tenantPhones.edges ?? []).map(
      (edge): DropdownOption<string> => ({
        id: edge.node.id,
        value: edge.node.phoneNumber,
      }),
    ),
  );
  const loadFailed = $derived(Boolean($senderPhonesQuery.errors));

  onMount(() => {
    void loadSenderPhones();
  });

  async function loadSenderPhones(): Promise<void> {
    await senderPhonesQuery.fetch();
    const selectedOption = options.find((option) => option.id === field.value) ?? options[0];

    if (selectedOption) {
      selectPhone(selectedOption);
    }
  }

  function selectPhone(option: DropdownOption<string>): void {
    field.value = option.id;
    phoneNumber = option.value;
  }
</script>

<Field>
  <Select
    {options}
    {field}
    label="Send from"
    inputId="campaign-sender-phone"
    placeholder={loadFailed ? "Could not load sending numbers" : "Select a sending number"}
    requiredMark
    loading={$senderPhonesQuery.fetching}
    disabled={loadFailed || options.length === 0}
    onChange={selectPhone}
  />
  <FieldError error={field.error} />

  {#if loadFailed}
    <Button class="mt-1" small variant="secondary" onclick={() => senderPhonesQuery.fetch()}>Try again</Button>
  {:else if !$senderPhonesQuery.fetching && options.length === 0}
    <p class="text-amber-700 text-xs">No sending numbers are available.</p>
  {/if}
</Field>
