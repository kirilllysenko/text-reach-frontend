<script lang="ts">
  import PopupMenu from '../popup-menu/PopupMenu.svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface ProfileData {
    name?: string | null;
    email?: string | null;
  }

  interface Props extends Omit<HTMLButtonAttributes, 'class' | 'type'> {
    profile?: ProfileData;
    class?: string;
    onProfileClick?: () => void;
    onSignOutClick?: () => void;
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
      text: 'Profile',
      clickHandler: () => {
        onPopupItemClicked?.();
        onProfileClick?.();
        menuOpen = false;
      }
    },
    {
      text: 'Sign out',
      clickHandler: () => {
        onPopupItemClicked?.();
        onSignOutClick?.();
        menuOpen = false;
      }
    }
  ]);

  const iconText = $derived.by(() => {
    if (!profile) return '';

    const trimmedName = profile.name?.trim();
    if (trimmedName) {
      return trimmedName
        .split(' ')
        .filter((value) => value.trim())
        .slice(0, 2)
        .map((value) => value.slice(0, 1).toUpperCase())
        .join('');
    }

    const email = profile.email?.trim();
    return email ? email.slice(0, 1).toUpperCase() : '';
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
  <div id={rootId} class={['relative', classProp]}>
    <button
      {...buttonProps}
      type="button"
      class="flex items-center gap-3 hover:cursor-pointer w-full"
      onclick={toggleMenu}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
    >
      <div class="size-8 rounded-full bg-slate-700 text-white flex justify-center items-center shadow-sm">
        {iconText}
      </div>
      <div class="flex-1 min-w-0 text-left">
        <div class="truncate text-slate-800">{profile.name}</div>
        <div class="truncate text-sm text-slate-500">{profile.email}</div>
      </div>
    </button>

    {#if menuOpen}
      <div class="absolute left-0 bottom-full mb-2 z-50 min-w-44" role="menu">
        <PopupMenu items={menuItems} />
      </div>
    {/if}
  </div>
{/if}
