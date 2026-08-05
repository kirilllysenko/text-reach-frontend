<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import ProfileButton from "$lib/components/profile-button/ProfileButton.svelte";
  import {
    CONTACT_SECTION_PATH,
    PATH_CAMPAIGN,
    PATH_CONTACT_GROUP,
    PATH_CONTACT,
    PATH_CONVERSATION,
    PATH_CUSTOM_FIELD,
    PATH_DASHBOARD,
    PATH_PAYMENT,
    PATH_PROFILE,
    PATH_SMART_GROUP,
    PATH_USER,
  } from "$lib/app/paths";
  import Campaign from "$lib/icons/Campaign.svelte";
  import ChevronDown from "$lib/icons/ChevronDown.svelte";
  import Contact from "$lib/icons/Contact.svelte";
  import Conversation from "$lib/icons/Conversation.svelte";
  import Dashboard from "$lib/icons/Dashboard.svelte";
  import Logo from "$lib/icons/Logo.svelte";
  import Payment from "$lib/icons/Payment.svelte";
  import Profile from "$lib/icons/Profile.svelte";
  import { sessionState } from "$lib/state/session.svelte";

  interface Props {
    onItemClicked?: () => void;
  }

  let { onItemClicked }: Props = $props();
  let showContactSubmenu = $state(false);

  const currentPath = $derived(page.url.pathname);
  const contactSectionActive = $derived(CONTACT_SECTION_PATH.includes(currentPath));
  const contactSubmenuOpen = $derived(showContactSubmenu);
  const paymentSectionActive = $derived(currentPath === PATH_PAYMENT || currentPath.startsWith(`${PATH_PAYMENT}/`));
  const userSectionActive = $derived(currentPath === PATH_USER || currentPath.startsWith(`${PATH_USER}/`));

  $effect(() => {
    if (CONTACT_SECTION_PATH.includes(currentPath)) {
      showContactSubmenu = true;
    }
  });

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
          ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
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
      href={PATH_CONVERSATION}
      class={[
        `group flex w-full items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
        isActive(PATH_CONVERSATION)
          ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
          : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
      ]}
      onclick={notifyItemClick}
    >
      <Conversation
        class={["size-6", isActive(PATH_CONVERSATION) ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]}
      />
      <span>Conversations</span>
    </a>
  </li>

  <li>
    <a
      href={PATH_CAMPAIGN}
      class={[
        `group flex w-full items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
        isActive(PATH_CAMPAIGN)
          ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
          : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
      ]}
      onclick={notifyItemClick}
    >
      <Campaign
        class={["size-6", isActive(PATH_CAMPAIGN) ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]}
      />
      <span>Campaigns</span>
    </a>
  </li>

  <li>
    <a
      href={PATH_PAYMENT}
      class={[
        `group flex w-full items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
        paymentSectionActive
          ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
          : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
      ]}
      onclick={notifyItemClick}
    >
      <Payment class={["size-6", paymentSectionActive ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]} />
      <span>Payments</span>
    </a>
  </li>

  <li>
    <div
      class={[
        `group flex items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
        contactSectionActive
          ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
          : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
      ]}
    >
      <a href={PATH_CONTACT} class="flex min-w-0 grow items-center gap-3" onclick={notifyItemClick}>
        <Contact
          class={["size-6 shrink-0", contactSectionActive ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]}
        />
        <span class="grow">Contacts</span>
      </a>

      <button
        class="rounded-full p-0.5 hover:cursor-pointer hover:bg-white/80"
        type="button"
        onclick={() => (showContactSubmenu = !showContactSubmenu)}
        aria-expanded={contactSubmenuOpen}
        aria-label={contactSubmenuOpen ? "Collapse contacts submenu" : "Expand contacts submenu"}
      >
        <ChevronDown
          class={["size-6 fill-slate-600 transition-transform", contactSubmenuOpen ? "rotate-180" : "rotate-0"]}
        />
      </button>
    </div>
  </li>

  <ul class={["overflow-hidden transition-all", contactSubmenuOpen ? "h-36" : "h-0"]}>
    <li>
      <a
        href={PATH_CONTACT_GROUP}
        class={[
          `block rounded-xl border py-3 pl-11 font-medium transition-colors`,
          isActive(PATH_CONTACT_GROUP)
            ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
            : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
               hover:bg-white/70 hover:text-slate-800`,
        ]}
        onclick={notifyItemClick}
      >
        Contact Groups
      </a>
    </li>

    <li>
      <a
        href={PATH_SMART_GROUP}
        class={[
          `block rounded-xl border py-3 pl-11 font-medium transition-colors`,
          isActive(PATH_SMART_GROUP)
            ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
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
        href={PATH_CUSTOM_FIELD}
        class={[
          `block rounded-xl border py-3 pl-11 font-medium transition-colors`,
          isActive(PATH_CUSTOM_FIELD)
            ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
            : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
               hover:bg-white/70 hover:text-slate-800`,
        ]}
        onclick={notifyItemClick}
      >
        Custom Fields
      </a>
    </li>
  </ul>

  <li>
    <a
      href={PATH_USER}
      class={[
        `group flex w-full items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
        userSectionActive
          ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
          : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
      ]}
      onclick={notifyItemClick}
    >
      <Profile class={["size-6", userSectionActive ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]} />
      <span>Users</span>
    </a>
  </li>

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
