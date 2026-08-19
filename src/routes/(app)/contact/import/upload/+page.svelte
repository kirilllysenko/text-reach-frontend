<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { BackButton, Card, PageTitle } from "$lib";
  import { PATH_CONTACT, PATH_CONTACT_IMPORT_HISTORY } from "$lib/app/paths";
  import ContactImportComplete from "./components/ContactImportComplete.svelte";
  import ContactImportSetup from "./components/ContactImportSetup.svelte";
  import { createContactImportState } from "./components/contact-import-state.svelte";
  import ContactImportMapping from "./components/mapping/ContactImportMapping.svelte";

  const contactImport = createContactImportState({ onQueued: () => {} });

  function goToContacts(): void {
    void goto(resolve(PATH_CONTACT));
  }

  function goToHistory(): void {
    void goto(resolve(PATH_CONTACT_IMPORT_HISTORY));
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2
    sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Import contacts">
    <BackButton>Contacts</BackButton>
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-6xl p-4 sm:p-6">
      {#if contactImport.step === "setup"}
        <ContactImportSetup {contactImport} onClose={goToContacts} />
      {:else if contactImport.step === "mapping"}
        <ContactImportMapping {contactImport} onClose={goToContacts} />
      {:else}
        <ContactImportComplete onDone={goToContacts} onHistory={goToHistory} />
      {/if}
    </Card>
  </div>
</div>
