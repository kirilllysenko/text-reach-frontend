import { createMemo, createSignal, For, onSettled, Show } from "solid-js";
import { SidebarPhoneNumbersDocument } from "~/gql/graphql";
import { formatPhoneNumber } from "~/lib/feature/phone/phone-display";
import { Phone } from "~/lib/icons";
import { graphqlClient } from "~/lib/graphql/client";
import { resetPhoneFilter, selectedPhoneId, selectPhone } from "~/lib/state/phone-filter";

interface PhoneOption {
  id: string;
  value: string;
}

export function PhoneFilter() {
  const [loading, setLoading] = createSignal(true);
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [phoneOptions, setPhoneOptions] = createSignal<PhoneOption[]>([]);
  const options = createMemo(() => [{ id: "", value: "All phones" }, ...phoneOptions()]);

  onSettled(() => {
    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await graphqlClient.query(SidebarPhoneNumbersDocument, {}, { requestPolicy: "network-only" });
        if (response.error || !response.data) {
          resetPhoneFilter();
          setLoadError("Phone numbers unavailable.");
          return;
        }

        const nextOptions = response.data.tenantPhones.edges.map(({ node }) => ({
          id: node.id,
          value: formatPhoneNumber(node.phoneNumber),
        }));
        setPhoneOptions(nextOptions);
        if (selectedPhoneId() && !nextOptions.some((option) => option.id === selectedPhoneId())) {
          resetPhoneFilter();
        }
      } catch {
        resetPhoneFilter();
        setLoadError("Phone numbers unavailable.");
      } finally {
        setLoading(false);
      }
    })();
  });

  return (
    <label class="block text-xs font-medium text-slate-600" for="global-phone-filter">
      Phone number
      <div class="glass-input mt-1 flex items-center gap-2 px-2">
        <Phone class="size-4 shrink-0 fill-slate-500" />
        <select
          id="global-phone-filter"
          class="min-w-0 grow bg-transparent py-2 text-sm text-slate-700 outline-none"
          disabled={loading()}
          value={selectedPhoneId() ?? ""}
          onChange={(event) => selectPhone(event.currentTarget.value || null)}
          aria-label="Filter the app by phone number"
        >
          <For each={options()}>{(option) => <option value={option.id}>{option.value}</option>}</For>
        </select>
      </div>
      <Show when={loadError()}>{(error) => <span class="mt-1 block text-xs text-rose-600">{error()}</span>}</Show>
    </label>
  );
}
