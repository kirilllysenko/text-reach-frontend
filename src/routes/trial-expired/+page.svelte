<script lang="ts">
  import AccountAccessPage from "$lib/feature/account-access/AccountAccessPage.svelte";

  const steps = [
    "If your business profile is already under review, wait for the review to finish.",
    "Ask your Mega Texting account contact to activate full access or confirm the review status.",
    "Return to sign in after your account has been activated.",
  ];
</script>

<AccountAccessPage
  eyebrow="7-day trial complete"
  title="Your free trial has ended"
  description="Access to this workspace is paused now that the trial period is over. Your account can be used again after full access is activated."
  note="If you believe your account was already activated, return to sign in and try again."
  {steps}
/>
