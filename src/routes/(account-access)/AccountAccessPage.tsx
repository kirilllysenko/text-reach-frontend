import { useLocation } from "@solidjs/router";
import { AccountAccessPage as AccountAccessContent } from "~/lib/feature/account-access/AccountAccessPage";

const pages = {
  "/account-closed": {
    eyebrow: "Account closed",
    title: "This account is no longer active",
    description: "The workspace has been closed and is not available for sign-in.",
    note: "A closed account cannot be reopened from this screen.",
    tone: "neutral" as const,
    steps: [
      "Confirm that you signed in with the intended email address.",
      "Contact the person who managed this Text Reach account if you need account records.",
      "Use another active account to continue working in Text Reach.",
    ],
  },
  "/account-suspended": {
    eyebrow: "Account paused",
    title: "This account is suspended",
    description:
      "Your workspace is temporarily unavailable. An account administrator must restore access before you can continue.",
    note: "Signing in again will not bypass a suspension.",
    steps: [
      "Check with the person who manages your Text Reach account.",
      "Resolve any outstanding account or compliance request.",
      "Return to sign in after an administrator restores access.",
    ],
  },
  "/account-unavailable": {
    eyebrow: "Access unavailable",
    title: "We can’t open this workspace",
    description: "Your session is valid, but it no longer has access to an active Text Reach workspace.",
    note: "For security, this page does not reveal whether the workspace or an individual membership changed.",
    tone: "neutral" as const,
    steps: [
      "Return to sign in and check that you are using the intended account.",
      "Ask the person who manages your workspace whether your access changed.",
      "Try again after the account or your membership has been restored.",
    ],
  },
  "/trial-expired": {
    eyebrow: "7-day trial complete",
    title: "Your free trial has ended",
    description:
      "Access to this workspace is paused now that the trial period is over. Your account can be used again after full access is activated.",
    note: "If you believe your account was already activated, return to sign in and try again.",
    steps: [
      "If your business profile is already under review, wait for the review to finish.",
      "Ask your Text Reach account contact to activate full access or confirm the review status.",
      "Return to sign in after your account has been activated.",
    ],
  },
} as const;

export default function AccountAccessPage() {
  const location = useLocation();
  const page = () => pages[location.pathname as keyof typeof pages] ?? pages["/account-unavailable"];
  return <AccountAccessContent {...page()} steps={[...page().steps]} />;
}
