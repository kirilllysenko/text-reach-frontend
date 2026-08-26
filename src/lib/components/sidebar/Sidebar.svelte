<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { AccessGroup } from "$houdini/graphql/enums";
  import ProfileButton from "text-reach-frontend-library/components/profile-button/ProfileButton.svelte";
  import {
    CONTACT_SECTION_PATH,
    PATH_CAMPAIGN,
    PATH_BUSINESS,
    PATH_CONTACT_GROUP,
    PATH_CONTACT,
    PATH_CONVERSATION,
    PATH_CUSTOM_FIELD,
    PATH_DASHBOARD,
    PATH_PAYMENT,
    PATH_PHONE,
    PATH_PROFILE,
    PATH_SMART_GROUP,
    PATH_UPGRADE,
    PATH_USER,
  } from "$lib/app/paths";
  import Campaign from "text-reach-frontend-library/icons/Campaign.svelte";
  import ChevronDown from "text-reach-frontend-library/icons/ChevronDown.svelte";
  import Contact from "text-reach-frontend-library/icons/Contact.svelte";
  import Conversation from "text-reach-frontend-library/icons/Conversation.svelte";
  import Dashboard from "text-reach-frontend-library/icons/Dashboard.svelte";
  import Logo from "text-reach-frontend-library/icons/Logo.svelte";
  import Payment from "text-reach-frontend-library/icons/Payment.svelte";
  import Phone from "text-reach-frontend-library/icons/Phone.svelte";
  import Profile from "text-reach-frontend-library/icons/Profile.svelte";
  import { sessionState } from "$lib/state/session.svelte";
  import PhoneFilter from "./PhoneFilter.svelte";

  interface Props {
    onItemClicked?: () => void;
  }

  let { onItemClicked }: Props = $props();
  let showContactSubmenu = $state(false);

  const currentPath = $derived(page.url.pathname);
  const contactSectionActive = $derived(CONTACT_SECTION_PATH.includes(currentPath));
  const contactSubmenuOpen = $derived(contactSectionActive || showContactSubmenu);
  const paymentSectionActive = $derived(currentPath === PATH_PAYMENT || currentPath.startsWith(`${PATH_PAYMENT}/`));
  const phoneSectionActive = $derived(
    currentPath === PATH_PHONE ||
      currentPath.startsWith(`${PATH_PHONE}/`) ||
      currentPath === PATH_BUSINESS ||
      currentPath.startsWith(`${PATH_BUSINESS}/`),
  );
  const userSectionActive = $derived(currentPath === PATH_USER || currentPath.startsWith(`${PATH_USER}/`));
  const upgradeSectionActive = $derived(currentPath === PATH_UPGRADE);
  const canReadBilling = $derived(sessionState.hasAccess(AccessGroup.BILLING_READ));
  const canReadCampaigns = $derived(sessionState.hasAccess(AccessGroup.CAMPAIGN_READ));
  const canReadContacts = $derived(sessionState.hasAccess(AccessGroup.CONTACT_READ));
  const canReadCustomFields = $derived(sessionState.hasAccess(AccessGroup.CUSTOM_FIELDS_READ));
  const canReadMessages = $derived(sessionState.hasAccess(AccessGroup.MESSAGE_READ));
  const canReadPhones = $derived(sessionState.hasAccess(AccessGroup.PHONE_READ));
  const canReadUsers = $derived(sessionState.hasAccess(AccessGroup.USER_READ));
  const canUpgrade = $derived(
    sessionState.hasAccess(AccessGroup.BUSINESS_PROFILE_WRITE) && sessionState.tenantLifecycle?.accessMode === "TRIAL",
  );

  function notifyItemClick(): void {
    onItemClicked?.();
  }

  function isActive(path: string): boolean {
    return currentPath === path;
  }

  async function goToProfile(): Promise<void> {
    notifyItemClick();
    await goto(resolve(PATH_PROFILE));
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

  {#if canReadPhones}
    <li class="mb-3">
      <PhoneFilter />
    </li>
  {/if}

  <li>
    <a
      id="sidebar-nav-dashboard"
      href={resolve(PATH_DASHBOARD)}
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

  {#if canReadMessages}
    <li>
      <a
        id="sidebar-nav-conversation"
        href={resolve(PATH_CONVERSATION)}
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
  {/if}

  {#if canReadCampaigns}
    <li>
      <a
        id="sidebar-nav-campaign"
        href={resolve(PATH_CAMPAIGN)}
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
  {/if}

  {#if canReadPhones}
    <li>
      <a
        id="sidebar-nav-phone"
        href={resolve(PATH_PHONE)}
        class={[
          `group flex w-full items-center gap-3 rounded-xl border px-2 py-3 font-medium
          transition-colors`,
          phoneSectionActive
            ? "active text-sky-800 border-sky-200/90 bg-sky-100/90 shadow-sm"
            : `border-transparent text-slate-700 hover:cursor-pointer hover:border-white/70
             hover:bg-white/70 hover:text-slate-800`,
        ]}
        onclick={notifyItemClick}
      >
        <Phone class={["size-6", phoneSectionActive ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]} />
        <span>Phone Numbers</span>
      </a>
    </li>
  {/if}

  {#if canReadBilling}
    <li>
      <a
        id="sidebar-nav-payment"
        href={resolve(PATH_PAYMENT)}
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
        <Payment
          class={["size-6", paymentSectionActive ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700"]}
        />
        <span>Payments</span>
      </a>
    </li>
  {/if}

  {#if canReadContacts}
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
        <a
          id="sidebar-nav-contact"
          href={resolve(PATH_CONTACT)}
          class="flex min-w-0 grow items-center gap-3"
          onclick={notifyItemClick}
        >
          <Contact
            class={[
              "size-6 shrink-0",
              contactSectionActive ? "fill-sky-700" : "fill-slate-500 group-hover:fill-sky-700",
            ]}
          />
          <span class="grow">Contacts</span>
        </a>

        <button
          id="sidebar-nav-contact-submenu"
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
          id="sidebar-nav-contact-group"
          href={resolve(PATH_CONTACT_GROUP)}
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
          id="sidebar-nav-smart-group"
          href={resolve(PATH_SMART_GROUP)}
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

      {#if canReadCustomFields}
        <li>
          <a
            id="sidebar-nav-custom-field"
            href={resolve(PATH_CUSTOM_FIELD)}
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
      {/if}
    </ul>
  {/if}

  {#if canReadUsers}
    <li>
      <a
        id="sidebar-nav-user"
        href={resolve(PATH_USER)}
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
  {/if}

  {#if canUpgrade}
    <li class="mt-3">
      <a
        id="sidebar-nav-upgrade"
        href={resolve(PATH_UPGRADE)}
        class={[
          `block rounded-xl border px-3 py-3 transition-colors`,
          upgradeSectionActive
            ? "text-sky-900 border-sky-300 bg-sky-100 shadow-sm"
            : "text-sky-900 border-sky-200/80 bg-sky-50/80 hover:border-sky-300 hover:bg-sky-100/80",
        ]}
        onclick={notifyItemClick}
      >
        <span class="block text-sm font-semibold">Upgrade to full access</span>
        <span class="mt-0.5 block text-xs leading-5 text-sky-700">
          {sessionState.tenantLifecycle?.businessVerification === "PENDING"
            ? "Your business is under review"
            : sessionState.tenantLifecycle?.businessVerification === "REJECTED"
              ? "Update your business details"
              : "Complete your business review"}
        </span>
      </a>
    </li>
  {/if}

  <li class="grow"></li>

  <li class="pt-5">
    <ProfileButton
      id="sidebar-profile-button"
      class="w-full rounded-xl border border-transparent px-2 py-2 hover:bg-white/60"
      profile={sessionState.profile ?? undefined}
      onProfileClick={goToProfile}
      onSignOutClick={signOutClick}
      onPopupItemClicked={notifyItemClick}
    />
  </li>
</ul>
