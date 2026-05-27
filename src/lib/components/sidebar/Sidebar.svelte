<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import ProfileButton from "$lib/components/profile-button/ProfileButton.svelte";
  import {
    CONTACT_SECTION_PATHS,
    PATH_CAMPAIGNS,
    PATH_CONTACTS,
    PATH_CONVERSATIONS,
    PATH_CUSTOM_FIELDS,
    PATH_DASHBOARD,
    PATH_GROUPS,
    PATH_PROFILE,
    PATH_SMART_GROUPS,
  } from "$lib/app/paths";
  import Campaigns from "$lib/icons/Campaigns.svelte";
  import ChevronDown from "$lib/icons/ChevronDown.svelte";
  import Contacts from "$lib/icons/Contacts.svelte";
  import Conversation from "$lib/icons/Conversation.svelte";
  import Dashboard from "$lib/icons/Dashboard.svelte";
  import Logo from "$lib/icons/Logo.svelte";
  import { sessionState } from "$lib/state/session.svelte";

  interface Props {
    onItemClicked?: () => void;
  }

  let { onItemClicked }: Props = $props();
  let showContactsSubmenu = $state(false);

  const currentPath = $derived(page.url.pathname);
  const contactsSectionActive = $derived(CONTACT_SECTION_PATHS.includes(currentPath));
  const contactsSubmenuOpen = $derived(showContactsSubmenu || contactsSectionActive);

  function notifyItemClick(): void {
    onItemClicked?.();
  }

  function isActive(path: string): boolean {
    return currentPath === path;
  }

  async function goToProfile(): Promise<void> {
    notifyItemClick();
    await goto(PATH_PROFILE);
  }

  async function signOutClick(): Promise<void> {
    notifyItemClick();
    await sessionState.signOutAndRedirect();
  }
</script>

<ul class="flex h-full flex-col px-6 py-6">
  <li class="mb-5 flex items-center gap-1 select-none">
    <Logo class="fill-sky-600 mt-[2px] size-8" />
    <span class="text-xl font-medium text-slate-800 [font-stretch:expanded]">Mega Texting</span>
  </li>

  <li>
    <a
      href={PATH_DASHBOARD}
      class={[
        `group flex w-full items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
        isActive(PATH_DASHBOARD)
          ? "active border-white/80 bg-white/75 text-sky-700 shadow-sm"
          : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
      ]}
      onclick={notifyItemClick}
    >
      <Dashboard
        class={["size-6", isActive(PATH_DASHBOARD) ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]}
      />
      <span>Dashboard</span>
    </a>
  </li>

  <li>
    <a
      href={PATH_CONVERSATIONS}
      class={[
        `group flex w-full items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
        isActive(PATH_CONVERSATIONS)
          ? "active border-white/80 bg-white/75 text-sky-700 shadow-sm"
          : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
      ]}
      onclick={notifyItemClick}
    >
      <Conversation
        class={["size-6", isActive(PATH_CONVERSATIONS) ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]}
      />
      <span>Conversations</span>
    </a>
  </li>

  <li>
    <a
      href={PATH_CAMPAIGNS}
      class={[
        `group flex w-full items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
        isActive(PATH_CAMPAIGNS)
          ? "active border-white/80 bg-white/75 text-sky-700 shadow-sm"
          : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
      ]}
      onclick={notifyItemClick}
    >
      <Campaigns
        class={["size-6", isActive(PATH_CAMPAIGNS) ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]}
      />
      <span>Campaigns</span>
    </a>
  </li>

  <li>
    <div
      class={[
        `group flex items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
        contactsSectionActive
          ? "active border-white/80 bg-white/75 text-sky-700 shadow-sm"
          : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
      ]}
    >
      <a href={PATH_CONTACTS} class="flex min-w-0 grow items-center gap-3" onclick={notifyItemClick}>
        <Contacts
          class={[
            "size-6 shrink-0",
            contactsSectionActive ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700",
          ]}
        />
        <span class="grow">Contacts</span>
      </a>

      <button
        class="rounded-full p-0.5 hover:cursor-pointer hover:bg-white/80"
        type="button"
        onclick={() => (showContactsSubmenu = !showContactsSubmenu)}
        aria-expanded={contactsSubmenuOpen}
        aria-label={contactsSubmenuOpen ? "Collapse contacts submenu" : "Expand contacts submenu"}
      >
        <ChevronDown
          class={["size-6 fill-slate-600 transition-transform", contactsSubmenuOpen ? "rotate-180" : "rotate-0"]}
        />
      </button>
    </div>
  </li>

  <ul class={["overflow-hidden transition-all", contactsSubmenuOpen ? "h-36" : "h-0"]}>
    <li>
      <a
        href={PATH_GROUPS}
        class={[
          `block rounded-xl border py-3 pl-11 font-medium transition-colors`,
          isActive(PATH_GROUPS)
            ? "active border-white/80 bg-white/75 text-sky-700 shadow-sm"
            : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
               hover:bg-white/70 hover:text-slate-800`,
        ]}
        onclick={notifyItemClick}
      >
        Groups
      </a>
    </li>

    <li>
      <a
        href={PATH_SMART_GROUPS}
        class={[
          `block rounded-xl border py-3 pl-11 font-medium transition-colors`,
          isActive(PATH_SMART_GROUPS)
            ? "active border-white/80 bg-white/75 text-sky-700 shadow-sm"
            : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
               hover:bg-white/70 hover:text-slate-800`,
        ]}
        onclick={notifyItemClick}
      >
        Smart Groups
      </a>
    </li>

    <li>
      <a
        href={PATH_CUSTOM_FIELDS}
        class={[
          `block rounded-xl border py-3 pl-11 font-medium transition-colors`,
          isActive(PATH_CUSTOM_FIELDS)
            ? "active border-white/80 bg-white/75 text-sky-700 shadow-sm"
            : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
               hover:bg-white/70 hover:text-slate-800`,
        ]}
        onclick={notifyItemClick}
      >
        Custom Fields
      </a>
    </li>
  </ul>

  <li class="grow"></li>

  <li class="pt-5">
    <ProfileButton
      class="w-full rounded-xl border border-transparent px-2 py-2 hover:bg-white/60"
      profile={sessionState.profile ?? undefined}
      onProfileClick={goToProfile}
      onSignOutClick={signOutClick}
      onPopupItemClicked={notifyItemClick}
    />
  </li>
</ul>
