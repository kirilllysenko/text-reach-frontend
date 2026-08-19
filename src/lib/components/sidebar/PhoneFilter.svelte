<script lang="ts">
  import { SidebarPhoneNumbersStore } from "$houdini";
  import { onMount } from "svelte";
  import { Select, type DropdownOption } from "$lib";
  import { formatPhoneNumber } from "$lib/feature/phone/phone-display";
  import Phone from "text-reach-frontend-library/icons/Phone.svelte";
  import { phoneFilterState } from "$lib/state/phone-filter.svelte";

  const allPhonesOption: DropdownOption<string | null> = { id: null, value: "All phones" };
  const phoneNumbersQuery = new SidebarPhoneNumbersStore();

  let loading = $state(true);
  let loadError = $state<string | null>(null);

  const options = $derived<DropdownOption<string | null>[]>([
    allPhonesOption,
    ...($phoneNumbersQuery.data?.tenantPhones.edges ?? []).map(({ node }) => ({
      id: node.id,
      value: formatPhoneNumber(node.phoneNumber),
    })),
  ]);
  const selectedOption = $derived(
    options.find((option) => option.id === phoneFilterState.selectedPhoneId) ?? allPhonesOption,
  );

  onMount(() => {
    void loadPhones();
  });

  async function loadPhones(): Promise<void> {
    loading = true;
    loadError = null;

    try {
      const response = await phoneNumbersQuery.fetch();
      if (response.errors || !response.data) {
        phoneFilterState.reset();
        loadError = "Phone numbers unavailable.";
        return;
      }

      const availablePhoneIds = new Set(response.data.tenantPhones.edges.map(({ node }) => node.id));
      if (phoneFilterState.selectedPhoneId && !availablePhoneIds.has(phoneFilterState.selectedPhoneId)) {
        phoneFilterState.reset();
      }
    } catch {
      phoneFilterState.reset();
      loadError = "Phone numbers unavailable.";
    } finally {
      loading = false;
    }
  }
</script>

<Select
  label="Phone number"
  inputId="global-phone-filter"
  {options}
  value={selectedOption}
  {loading}
  error={loadError}
  onChange={(option) => phoneFilterState.selectPhone(option.id)}
  aria-label="Filter the app by phone number"
>
  {#snippet leftAddon()}
    <Phone class="size-4 shrink-0 fill-slate-500" />
  {/snippet}
</Select>
