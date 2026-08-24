import type { TenantLifecycleData } from "$lib/state/session.svelte";

export interface UpgradeStatusView {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionPath: "business" | "business-edit" | "dashboard";
  tone: "neutral" | "pending" | "rejected" | "success";
}

export function tenantUpgradeStatus(lifecycle: TenantLifecycleData): UpgradeStatusView {
  if (lifecycle.accessMode === "FULL") {
    return {
      eyebrow: "Upgrade complete",
      title: "Full access is active",
      description: "Your business is verified and your workspace no longer has a trial expiration.",
      actionLabel: "Go to dashboard",
      actionPath: "dashboard",
      tone: "success",
    };
  }

  switch (lifecycle.businessVerification) {
    case "PENDING":
      return {
        eyebrow: "Step 2 of 3",
        title: "Your business is under review",
        description:
          "Your submitted business information is ready for an administrator to review. You can keep using your trial while the review is in progress.",
        actionLabel: "Review submitted details",
        actionPath: "business",
        tone: "pending",
      };
    case "REJECTED":
      return {
        eyebrow: "Action required",
        title: "Update your business information",
        description:
          "The submitted details could not be approved. Review them for accuracy, make any needed changes, and resubmit them for another review.",
        actionLabel: "Update and resubmit",
        actionPath: "business-edit",
        tone: "rejected",
      };
    case "VERIFIED":
      return {
        eyebrow: "Step 3 of 3",
        title: "Activation is in progress",
        description:
          "Your business information is verified. An administrator still needs to activate full access for this workspace.",
        actionLabel: "Review business details",
        actionPath: "business",
        tone: "pending",
      };
    default:
      return {
        eyebrow: "Step 1 of 3",
        title: "Submit your business information",
        description:
          "Tell us about your legal business and authorized contact. Submitting these details starts the review for full access.",
        actionLabel: "Start upgrade",
        actionPath: "business-edit",
        tone: "neutral",
      };
  }
}

export function trialTimeText(trialEndsAt: string, now = new Date()): string {
  const end = new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return "Trial expiration unavailable";

  const remainingMilliseconds = end.getTime() - now.getTime();
  if (remainingMilliseconds <= 0) return "Trial ended";

  const remainingHours = Math.ceil(remainingMilliseconds / (60 * 60 * 1000));
  if (remainingHours < 24) return `${remainingHours} ${remainingHours === 1 ? "hour" : "hours"} remaining`;

  const remainingDays = Math.ceil(remainingHours / 24);
  return `${remainingDays} ${remainingDays === 1 ? "day" : "days"} remaining`;
}

export function formatTrialEnd(trialEndsAt: string): string | null {
  const end = new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(end);
}
