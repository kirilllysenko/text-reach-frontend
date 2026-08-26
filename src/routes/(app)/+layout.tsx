import type { ParentProps } from "solid-js";
import { AppShell } from "~/components/AppShell";

export default function AppLayout(props: ParentProps) {
  return <AppShell>{props.children}</AppShell>;
}
