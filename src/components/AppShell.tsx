import { useNavigate } from "@solidjs/router";
import { createSignal, onSettled, Show, type ParentProps } from "solid-js";
import { Menu } from "~/lib/icons";
import { classes } from "~/lib/styles/classes";
import { closeSidebar, openSidebar, sidebarOpened } from "~/lib/state/app-shell";
import { ensureAppAccess, loadProfile, loadTenantLifecycle, session } from "~/lib/state/session";
import { Sidebar } from "./sidebar/Sidebar";

export function AppShell(props: ParentProps) {
  const navigate = useNavigate();
  const [render, setRender] = createSignal(false);

  onSettled(() => {
    void (async () => {
      closeSidebar();
      if (!(await ensureAppAccess(navigate))) return;
      await Promise.all([loadProfile(), loadTenantLifecycle()]);
      setRender(true);
    })();
  });

  return (
    <Show when={render()} fallback={<div class="h-dvh bg-linear-to-br from-slate-100 via-slate-50 to-stone-100" />}>
      <div id="app-shell" class="min-h-dvh bg-linear-to-br from-slate-100 via-slate-50 to-stone-100">
        <button
          class={classes([
            `fixed top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-20 rounded-full border border-white/80 bg-white/90 p-1.5 shadow-sm backdrop-blur-md transition-opacity sm:hidden`,
            sidebarOpened() && "pointer-events-none opacity-0",
          ])}
          type="button"
          onClick={openSidebar}
          aria-label="Open sidebar"
        >
          <Menu class="size-6 fill-slate-600" />
        </button>
        <div class="min-h-dvh sm:ml-70 sm:p-6">{props.children}</div>
        <button
          class={classes([
            "fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] transition-opacity sm:hidden",
            sidebarOpened() ? "opacity-30" : "pointer-events-none opacity-0",
          ])}
          type="button"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
        <aside
          class={classes([
            `fixed top-0 left-0 z-40 h-dvh w-70 overflow-y-auto border-r border-white/80 bg-white/70 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md transition-transform sm:translate-x-0`,
            sidebarOpened() ? "translate-x-0" : "-translate-x-full",
          ])}
        >
          <Sidebar onItemClicked={closeSidebar} />
        </aside>
      </div>
    </Show>
  );
}
