import { useLocation } from "@solidjs/router";
import { createMemo, createSignal, For, Show, type Component } from "solid-js";
import type { AccessGroup } from "~/gql/graphql";
import {
  CONTACT_SECTION_PATH,
  PATH_CAMPAIGN,
  PATH_BUSINESS,
  PATH_CONTACT,
  PATH_CONTACT_GROUP,
  PATH_CONVERSATION,
  PATH_CUSTOM_FIELD,
  PATH_DASHBOARD,
  PATH_PAYMENT,
  PATH_PHONE,
  PATH_SMART_GROUP,
  PATH_UPGRADE,
  PATH_USER,
} from "~/lib/app/paths";
import { Campaign, ChevronDown, Contact, Conversation, Dashboard, Logo, Payment, Phone, Profile } from "~/lib/icons";
import { classes } from "~/lib/styles/classes";
import { hasAccess, session } from "~/lib/state/session";
import { PhoneFilter } from "./PhoneFilter";
import { ProfileMenu } from "./ProfileMenu";

interface SidebarProps {
  onItemClicked: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: Component<{ class?: string }>;
  access?: AccessGroup;
  sectionPrefix?: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: PATH_DASHBOARD, icon: Dashboard },
  { id: "conversation", label: "Conversations", href: PATH_CONVERSATION, icon: Conversation, access: "MESSAGE_READ" },
  { id: "campaign", label: "Campaigns", href: PATH_CAMPAIGN, icon: Campaign, access: "CAMPAIGN_READ" },
  {
    id: "phone",
    label: "Phone Numbers",
    href: PATH_PHONE,
    icon: Phone,
    access: "PHONE_READ",
    sectionPrefix: PATH_BUSINESS,
  },
  { id: "payment", label: "Payments", href: PATH_PAYMENT, icon: Payment, access: "BILLING_READ" },
  { id: "user", label: "Users", href: PATH_USER, icon: Profile, access: "USER_READ" },
];

export function Sidebar(props: SidebarProps) {
  const location = useLocation();
  const [showContactSubmenu, setShowContactSubmenu] = createSignal(false);
  const contactSectionActive = () => CONTACT_SECTION_PATH.includes(location.pathname);
  const contactSubmenuOpen = () => contactSectionActive() || showContactSubmenu();
  const canReadContacts = () => hasAccess("CONTACT_READ");
  const canReadCustomFields = () => hasAccess("CUSTOM_FIELDS_READ");
  const canUpgrade = () => hasAccess("BUSINESS_PROFILE_WRITE") && session.tenantLifecycle?.accessMode === "TRIAL";
  const visibleNavItems = createMemo(() => navItems.filter((item) => !item.access || hasAccess(item.access)));

  function active(item: NavItem): boolean {
    return (
      location.pathname === item.href ||
      location.pathname.startsWith(`${item.href}/`) ||
      Boolean(item.sectionPrefix && location.pathname.startsWith(item.sectionPrefix))
    );
  }

  const linkClass = (isActive: boolean) =>
    classes([
      "group flex w-full items-center gap-3 rounded-xl border px-2 py-3 font-medium transition-colors",
      isActive
        ? "border-sky-200/90 bg-sky-100/90 text-sky-800 shadow-sm"
        : "border-transparent text-slate-700 hover:border-white/70 hover:bg-white/70 hover:text-slate-800",
    ]);

  return (
    <ul class="flex h-full flex-col px-6 py-6">
      <li class="mb-5 flex items-center gap-1 select-none">
        <Logo class="fill-sky-600 mt-[2px] size-8" />
        <span class="text-xl font-medium text-slate-800 [font-stretch:expanded]">Text Reach</span>
      </li>
      <Show when={hasAccess("PHONE_READ")}>
        <li class="mb-3">
          <PhoneFilter />
        </li>
      </Show>
      <For each={visibleNavItems().filter((item) => item.id !== "user")}>
        {(item) => (
          <li>
            <a href={item.href} class={linkClass(active(item))} onClick={props.onItemClicked}>
              <item.icon class={classes(["size-6", active(item) ? "fill-sky-700" : "fill-slate-500"])} />
              <span>{item.label}</span>
            </a>
          </li>
        )}
      </For>
      <Show when={canReadContacts()}>
        <li>
          <div class={linkClass(contactSectionActive())}>
            <a href={PATH_CONTACT} class="flex min-w-0 grow items-center gap-3" onClick={props.onItemClicked}>
              <Contact class={classes(["size-6", contactSectionActive() ? "fill-sky-700" : "fill-slate-500"])} />
              <span class="grow">Contacts</span>
            </a>
            <button
              class="rounded-full p-0.5 hover:cursor-pointer hover:bg-white/80"
              type="button"
              onClick={() => setShowContactSubmenu((value) => !value)}
              aria-expanded={contactSubmenuOpen() ? "true" : "false"}
              aria-label={contactSubmenuOpen() ? "Collapse contacts submenu" : "Expand contacts submenu"}
            >
              <ChevronDown
                class={classes([
                  "size-6 fill-slate-600 transition-transform",
                  contactSubmenuOpen() ? "rotate-180" : "rotate-0",
                ])}
              />
            </button>
          </div>
        </li>
        <ul class={classes(["shrink-0 overflow-hidden transition-all", contactSubmenuOpen() ? "h-36" : "h-0"])}>
          <li>
            <a
              href={PATH_CONTACT_GROUP}
              class={linkClass(location.pathname === PATH_CONTACT_GROUP)}
              onClick={props.onItemClicked}
            >
              Contact Groups
            </a>
          </li>
          <li>
            <a
              href={PATH_SMART_GROUP}
              class={linkClass(location.pathname === PATH_SMART_GROUP)}
              onClick={props.onItemClicked}
            >
              Smart Groups
            </a>
          </li>
          <Show when={canReadCustomFields()}>
            <li>
              <a
                href={PATH_CUSTOM_FIELD}
                class={linkClass(location.pathname === PATH_CUSTOM_FIELD)}
                onClick={props.onItemClicked}
              >
                Custom Fields
              </a>
            </li>
          </Show>
        </ul>
      </Show>
      <For each={visibleNavItems().filter((item) => item.id === "user")}>
        {(item) => (
          <li>
            <a href={item.href} class={linkClass(active(item))} onClick={props.onItemClicked}>
              <item.icon class={classes(["size-6", active(item) ? "fill-sky-700" : "fill-slate-500"])} />
              <span>{item.label}</span>
            </a>
          </li>
        )}
      </For>
      <Show when={canUpgrade()}>
        <li class="mt-3">
          <a
            id="sidebar-nav-upgrade"
            href={PATH_UPGRADE}
            class="text-sky-900 block rounded-xl border border-sky-200/80 bg-sky-50/80 px-3 py-3"
            onClick={props.onItemClicked}
          >
            <span class="block text-sm font-semibold">Upgrade to full access</span>
            <span class="mt-0.5 block text-xs leading-5 text-sky-700">{upgradeSidebarDescription()}</span>
          </a>
        </li>
      </Show>
      <li class="grow" />
      <li class="pt-5">
        <ProfileMenu onItemClicked={props.onItemClicked} />
      </li>
    </ul>
  );
}

function upgradeSidebarDescription(): string {
  if (session.tenantLifecycle?.businessVerification === "PENDING") return "Your business is under review";
  if (session.tenantLifecycle?.businessVerification === "REJECTED") return "Update your business details";
  return "Complete your business review";
}
