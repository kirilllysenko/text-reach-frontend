<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import { resolve } from "$app/paths";
  import { CreateTopupCheckoutSessionStore, PaymentConfigStore } from "$houdini";
  import { loadStripe, type StripeCheckoutLoadActionsSuccess, type StripePaymentElement } from "@stripe/stripe-js";
  import { Button, Input, PageTitle } from "$lib";
  import { PATH_PAYMENT } from "$lib/app/paths";
  import { dollarsToUsdMicros, formatUsdMicros } from "$lib/feature/payment/payment-display";
  import { createFormValue } from "text-reach-frontend-library/form";

  const PRESET_AMOUNTS = [10, 25, 50, 100];

  interface PaymentConfigData {
    currency: string;
    maxTopupUsdMicros: number;
    minTopupUsdMicros: number;
    stripePublishableKey: string;
  }

  const paymentConfigQuery = new PaymentConfigStore();
  const createCheckoutSessionMutation = new CreateTopupCheckoutSessionStore();

  let paymentConfig = $state<PaymentConfigData | null>(null);
  let loadingConfig = $state(false);
  let startingSession = $state(false);
  let confirming = $state(false);
  let selectedPreset = $state(PRESET_AMOUNTS[0]);
  const customAmount = $state(createFormValue<number | string>(""));
  let message = $state<string | null>(null);
  let error = $state<string | null>(null);
  let paymentElementContainer = $state<HTMLDivElement | null>(null);
  let paymentElement = $state.raw<StripePaymentElement | null>(null);
  let checkoutActions = $state.raw<StripeCheckoutLoadActionsSuccess | null>(null);

  const selectedAmountDollars = $derived.by(() => {
    const customValue = Number(customAmount.value);
    return String(customAmount.value).trim() && Number.isFinite(customValue) ? customValue : selectedPreset;
  });
  const selectedAmountMicros = $derived(dollarsToUsdMicros(selectedAmountDollars));
  const minAmountMicros = $derived(paymentConfig?.minTopupUsdMicros ?? 0);
  const maxAmountMicros = $derived(paymentConfig?.maxTopupUsdMicros ?? Number.MAX_SAFE_INTEGER);
  const amountValid = $derived(
    selectedAmountMicros >= minAmountMicros && selectedAmountMicros <= maxAmountMicros && selectedAmountMicros > 0,
  );

  onMount(() => {
    void loadPaymentConfig();
  });

  onDestroy(() => {
    paymentElement?.destroy();
  });

  async function loadPaymentConfig(): Promise<void> {
    loadingConfig = true;

    try {
      const response = await paymentConfigQuery.fetch();

      if (response.errors || !response.data) {
        handleError("Could not load payment settings.");
        return;
      }

      paymentConfig = response.data.paymentConfig;
      error = null;
    } catch {
      handleError("Could not load payment settings.");
    } finally {
      loadingConfig = false;
    }
  }

  async function startTopUp(): Promise<void> {
    if (!paymentConfig || !amountValid || !paymentElementContainer || startingSession) {
      return;
    }

    startingSession = true;
    message = null;
    error = null;
    checkoutActions = null;
    paymentElement?.destroy();
    paymentElement = null;

    try {
      const response = await createCheckoutSessionMutation.mutate({
        input: { amountUsdMicros: selectedAmountMicros },
      });

      if (response.errors || !response.data) {
        handleError("Could not start top up.");
        return;
      }

      const session = response.data.createTopupCheckoutSession;

      const stripe = await loadStripe(paymentConfig.stripePublishableKey);

      if (!stripe) {
        error = "Could not load Stripe.";
        return;
      }

      const checkout = stripe.initCheckoutElementsSdk({
        clientSecret: session.clientSecret,
        elementsOptions: {
          appearance: {
            theme: "stripe",
          },
        },
      });
      const element = checkout.createPaymentElement();
      const actionsResult = await checkout.loadActions();

      if (actionsResult.type === "error") {
        error = actionsResult.error.message;
        return;
      }

      element.mount(paymentElementContainer);
      paymentElement = element;
      checkoutActions = actionsResult.actions;
      message = `${formatUsdMicros(session.amountUsdMicros)} top up is ready.`;
    } catch {
      error = "Could not start top up.";
    } finally {
      startingSession = false;
    }
  }

  async function confirmPayment(): Promise<void> {
    if (!checkoutActions || confirming) {
      return;
    }

    confirming = true;
    error = null;
    message = null;

    try {
      const result = await checkoutActions.confirm({
        returnUrl: `${window.location.origin}${PATH_PAYMENT}`,
      });

      if (result.type === "error") {
        error = result.error.message;
        return;
      }

      message = "Payment submitted.";
    } catch {
      error = "Could not confirm payment.";
    } finally {
      confirming = false;
    }
  }

  function selectPreset(amount: number): void {
    selectedPreset = amount;
    customAmount.value = "";
  }

  const attachPaymentElementContainer: Attachment<HTMLDivElement> = (element) => {
    paymentElementContainer = element;

    return () => {
      paymentElementContainer = null;
    };
  };

  function handleError(fallback: string): void {
    error = fallback;
  }
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Top Up">
    <a
      id="payment-top-up-balance-link"
      href={resolve(PATH_PAYMENT)}
      class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-3
        text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
    >
      Balance
    </a>
  </PageTitle>

  <section
    class="grid min-h-0 grow grid-cols-1 gap-3 overflow-y-auto rounded-2xl border border-white/70 bg-white/60
      p-3 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md lg:grid-cols-[22rem_1fr]"
  >
    <form
      class="space-y-4 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm"
      onsubmit={(event) => {
        event.preventDefault();
        void startTopUp();
      }}
    >
      <div>
        <h2 class="text-base font-semibold text-slate-800">Amount</h2>
        <p class="mt-1 text-sm text-slate-500">
          {#if paymentConfig}
            {formatUsdMicros(minAmountMicros)} to {formatUsdMicros(maxAmountMicros)}
          {:else}
            Loading limits
          {/if}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2">
        {#each PRESET_AMOUNTS as amount (amount)}
          <Button
            id={`payment-top-up-preset-${amount}`}
            variant="secondary"
            active={selectedPreset === amount && !customAmount.value}
            class="h-11 rounded-xl px-3 text-sm font-semibold"
            onclick={() => selectPreset(amount)}
          >
            {formatUsdMicros(dollarsToUsdMicros(amount))}
          </Button>
        {/each}
      </div>

      <label class="block space-y-1">
        <span class="text-xs font-medium text-slate-500">Custom amount</span>
        <Input
          id="payment-top-up-custom-amount"
          type="number"
          min="1"
          step="0.01"
          placeholder="75.00"
          field={customAmount}
          disabled={loadingConfig}
        />
      </label>

      <div
        id="payment-top-up-selected-amount"
        class="rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-sm text-slate-600"
      >
        Selected: <span class="font-semibold text-slate-800">{formatUsdMicros(selectedAmountMicros)}</span>
      </div>

      <Button
        id="payment-top-up-continue"
        class="w-full"
        submit
        disabled={!paymentConfig || !amountValid}
        spinner={startingSession}
      >
        Continue
      </Button>
    </form>

    <div class="min-h-[24rem] rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
      <div {@attach attachPaymentElementContainer} class="min-h-32"></div>

      {#if checkoutActions}
        <div class="mt-4">
          <Button id="payment-top-up-pay" class="w-full" onclick={confirmPayment} spinner={confirming}>Pay</Button>
        </div>
      {/if}

      {#if message}
        <div
          id="payment-top-up-message"
          class="text-sky-900 mt-4 rounded-xl border border-sky-200/80 bg-sky-50/90 px-3 py-2 text-sm"
        >
          {message}
        </div>
      {/if}

      {#if error}
        <div
          id="payment-top-up-error"
          class="text-amber-900 mt-4 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm"
        >
          {error}
        </div>
      {/if}
    </div>
  </section>
</div>
