import { Title } from "@solidjs/meta";
import { Loading, type ParentProps } from "solid-js";
import { NotificationsLayout } from "text-reach-frontend-library/components";

export default function RootLayout(props: ParentProps) {
  return (
    <>
      <Title>Text Reach</Title>
      <Loading>{props.children}</Loading>
      <NotificationsLayout />
    </>
  );
}
