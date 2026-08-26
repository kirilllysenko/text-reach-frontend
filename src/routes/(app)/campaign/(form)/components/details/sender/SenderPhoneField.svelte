<script lang="ts">
  import { onMount } from "svelte";
  import { CampaignFormSenderPhonesStore } from "$houdini";
  import { Button, Field, FieldError, Select, type DropdownOption } from "$lib";

  interface Props {
    error?: string | null;
    phoneNumber?: string;
    value?: string;
  }

  const senderPhonesQuery = new CampaignFormSenderPhonesStore();
  let { error = null, phoneNumber = $bindable(""), value = $bindable("") }: Props = $props();

  const options = $derived(
    ($senderPhonesQuery.data?.tenantPhones.edges ?? []).map(
      (edge): DropdownOption<string> => ({
        id: edge.node.id,
        value: edge.node.phoneNumber,
      }),
    ),
  );
  const selectedOption = $derived(options.find((option) => option.id === value));
  const loadFailed = $derived(Boolean($senderPhonesQuery.errors));

  onMount(() => {
    void senderPhonesQuery.fetch();
  });

  $effect(() => {
    if (!value && options[0]) {
      value = options[0].id;
    }

    phoneNumber = options.find((option) => option.id === value)?.value ?? "";
  });

  function selectPhone(option: DropdownOption<string>): void {
    value = option.id;
    phoneNumber = option.value;
  }
</script>

<Field>
  <Select
    {options}
    value={selectedOption}
    label="Send from"
    inputId="campaign-sender-phone"
    placeholder={loadFailed ? "Could not load sending numbers" : "Select a sending number"}
    requiredMark
    loading={$senderPhonesQuery.fetching}
    disabled={loadFailed || options.length === 0}
    {error}
    onChange={selectPhone}
  />
  <FieldError {error} />

  {#if loadFailed}
    <Button class="mt-1" small variant="secondary" onclick={() => senderPhonesQuery.fetch()}>Try again</Button>
  {:else if !$senderPhonesQuery.fetching && options.length === 0}
    <p class="text-amber-700 text-xs">No sending numbers are available.</p>
  {/if}
</Field>
