<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import Avatar from "$lib/components/avatar/Avatar.svelte";
  import Logout from "$lib/icons/Logout.svelte";
  import Profile from "$lib/icons/Profile.svelte";
  import PopupMenu from "../popup-menu/PopupMenu.svelte";

  interface ProfileData {
    name?: string | null;
    email?: string | null;
  }

  interface Props extends Omit<HTMLButtonAttributes, "class" | "type"> {
    profile?: ProfileData;
    class?: string;
    onProfileClick?: () => void | Promise<void>;
    onSignOutClick?: () => void | Promise<void>;
    onPopupItemClicked?: () => void;
  }

  let {
    class: classProp,
    profile,
    onProfileClick,
    onSignOutClick,
    onPopupItemClicked,
    ...buttonProps
  }: Props = $props();

  const uid = crypto.randomUUID();
  const rootId = `${uid}-profile-button`;
  let menuOpen = $state(false);

  const menuItems = $derived([
    {
      icon: Profile,
      text: "Profile",
      clickHandler: () => {
        onPopupItemClicked?.();
        void onProfileClick?.();
        menuOpen = false;
      },
    },
    {
      icon: Logout,
      text: "Sign out",
      clickHandler: () => {
        onPopupItemClicked?.();
        void onSignOutClick?.();
        menuOpen = false;
      },
    },
  ]);

  const iconText = $derived.by(() => {
    if (!profile) return "";

    const trimmedName = profile.name?.trim();
    if (trimmedName) {
      return trimmedName
        .split(" ")
        .filter((value) => value.trim())
        .slice(0, 2)
        .map((value) => value.slice(0, 1).toUpperCase())
        .join("");
    }

    const email = profile.email?.trim();
    return email ? email.slice(0, 1).toUpperCase() : "";
  });

  function toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    menuOpen = !menuOpen;
  }

  function closeOnOutsideClick(event: PointerEvent): void {
    if (!menuOpen) return;

    const target = event.target as Node | null;
    if (!target) return;
    const rootEl = document.getElementById(rootId);
    if (rootEl?.contains(target)) return;

    menuOpen = false;
  }
</script>

<svelte:document onpointerdown={closeOnOutsideClick} />

{#if profile}
  <div id={rootId} class={["relative", classProp]}>
    <button
      {...buttonProps}
      type="button"
      class="flex w-full items-center gap-3 text-left hover:cursor-pointer"
      onclick={toggleMenu}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
    >
      <Avatar {profile} />
      <div class="min-w-0 flex-1">
        <div class="truncate text-slate-800">{profile.name}</div>
        <div class="truncate text-sm text-slate-500">{profile.email}</div>
      </div>
    </button>

    {#if menuOpen}
      <div class="absolute bottom-full left-0 z-50 mb-2 min-w-44" role="menu">
        <PopupMenu items={menuItems} />
      </div>
    {/if}
  </div>
{/if}
