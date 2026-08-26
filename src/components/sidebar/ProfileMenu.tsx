import { useNavigate } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import { PATH_PROFILE } from "~/lib/app/paths";
import { Logout, Profile } from "~/lib/icons";
import { session, signOutAndRedirect } from "~/lib/state/session";

interface ProfileMenuProps {
  onItemClicked: () => void;
}

export function ProfileMenu(props: ProfileMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = createSignal(false);
  let rootElement: HTMLDivElement | undefined;

  const initials = () => {
    const name = session.profile?.name?.trim();
    if (name) {
      return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    }
    return session.profile?.email.slice(0, 1).toUpperCase() ?? "";
  };

  function closeOutside(event: PointerEvent): void {
    if (open() && event.target instanceof Node && !rootElement?.contains(event.target)) setOpen(false);
  }

  onSettled(() => {
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  });

  return (
    <Show when={session.profile}>
      <div ref={rootElement} class="relative w-full rounded-xl border border-transparent px-2 py-2 hover:bg-white/60">
        <button
          type="button"
          class="flex w-full items-center gap-3 text-left hover:cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
          }}
          aria-haspopup="menu"
          aria-expanded={open() ? "true" : "false"}
        >
          <span class="text-sky-800 grid size-9 shrink-0 place-items-center rounded-full bg-sky-100 font-semibold">
            {initials()}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-slate-800">{session.profile?.name}</span>
            <span class="block truncate text-sm text-slate-500">{session.profile?.email}</span>
          </span>
        </button>
        <Show when={open()}>
          <div
            class="absolute bottom-full left-0 z-50 mb-2 min-w-44 rounded-xl border border-white/80 bg-white/95 p-1 shadow-lg"
            role="menu"
          >
            <button
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-100"
              type="button"
              role="menuitem"
              onClick={() => {
                props.onItemClicked();
                setOpen(false);
                navigate(PATH_PROFILE);
              }}
            >
              <Profile class="size-5 fill-slate-500" /> Profile
            </button>
            <button
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-100"
              type="button"
              role="menuitem"
              onClick={() => {
                props.onItemClicked();
                setOpen(false);
                void signOutAndRedirect(navigate);
              }}
            >
              <Logout class="size-5 fill-slate-500" /> Sign out
            </button>
          </div>
        </Show>
      </div>
    </Show>
  );
}
