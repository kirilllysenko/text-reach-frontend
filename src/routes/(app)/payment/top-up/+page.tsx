import { loadStripe, type StripeCheckoutLoadActionsSuccess, type StripePaymentElement } from "@stripe/stripe-js";
import { createMemo, createSignal, For, onSettled, Show } from "solid-js";
import { CreateTopupCheckoutSessionDocument, PaymentConfigDocument, type PaymentConfigQuery } from "~/gql/graphql";
import { PATH_PAYMENT } from "~/lib/app/paths";
import { Button, Input, PageTitle } from "~/components";
import { dollarsToUsdMicros, formatUsdMicros } from "~/lib/feature/payment/payment-display";
import { graphqlClient } from "~/lib/graphql/client";

type PaymentConfig = PaymentConfigQuery["paymentConfig"];
const presetAmounts = [10, 25, 50, 100];

export default function PaymentTopUpPage() {
  const [config, setConfig] = createSignal<PaymentConfig | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [starting, setStarting] = createSignal(false);
  const [confirming, setConfirming] = createSignal(false);
  const [preset, setPreset] = createSignal(10);
  const [customAmount, setCustomAmount] = createSignal("");
  const [message, setMessage] = createSignal<string | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [actions, setActions] = createSignal<StripeCheckoutLoadActionsSuccess | null>(null);
  let container: HTMLDivElement | undefined;
  let paymentElement: StripePaymentElement | null = null;
  const dollars = createMemo(() =>
    customAmount().trim() && Number.isFinite(Number(customAmount())) ? Number(customAmount()) : preset(),
  );
  const micros = createMemo(() => dollarsToUsdMicros(dollars()));
  const amountValid = createMemo(() =>
    Boolean(config() && micros() >= config()!.minTopupUsdMicros && micros() <= config()!.maxTopupUsdMicros),
  );

  onSettled(() => {
    void loadConfig();
    return () => paymentElement?.destroy();
  });

  async function loadConfig(): Promise<void> {
    setLoading(true);
    try {
      const response = await graphqlClient.query(PaymentConfigDocument, {}, { requestPolicy: "network-only" });
      if (response.error || !response.data) throw new Error();
      setConfig(response.data.paymentConfig);
      setError(null);
    } catch {
      setError("Could not load payment settings.");
    } finally {
      setLoading(false);
    }
  }

  async function startTopUp(): Promise<void> {
    const paymentConfig = config();
    if (!paymentConfig || !amountValid() || !container || starting()) return;
    setStarting(true);
    setMessage(null);
    setError(null);
    setActions(null);
    paymentElement?.destroy();
    paymentElement = null;
    try {
      const response = await graphqlClient.mutation(CreateTopupCheckoutSessionDocument, {
        input: { amountUsdMicros: micros() },
      });
      if (response.error || !response.data) throw new Error();
      const session = response.data.createTopupCheckoutSession;
      const stripe = await loadStripe(paymentConfig.stripePublishableKey);
      if (!stripe) {
        setError("Could not load Stripe.");
        return;
      }
      const checkout = stripe.initCheckoutElementsSdk({
        clientSecret: session.clientSecret,
        elementsOptions: { appearance: { theme: "stripe" } },
      });
      const element = checkout.createPaymentElement();
      const result = await checkout.loadActions();
      if (result.type === "error") {
        setError("Could not prepare payment.");
        return;
      }
      element.mount(container);
      paymentElement = element;
      setActions(result.actions);
      setMessage(`${formatUsdMicros(session.amountUsdMicros)} top up is ready.`);
    } catch {
      setError("Could not start top up.");
    } finally {
      setStarting(false);
    }
  }

  async function confirm(): Promise<void> {
    if (!actions() || confirming()) return;
    setConfirming(true);
    setError(null);
    setMessage(null);
    try {
      const result = await actions()!.confirm({ returnUrl: `${window.location.origin}${PATH_PAYMENT}` });
      if (result.type === "error") {
        setError("Could not confirm payment.");
        return;
      }
      setMessage("Payment submitted.");
    } catch {
      setError("Could not confirm payment.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Top Up">
        <a
          href={PATH_PAYMENT}
          class="flex h-9 items-center rounded-xl border border-white/80 bg-white/90 px-3 text-sm font-medium text-slate-700"
        >
          Balance
        </a>
      </PageTitle>
      <section class="grid min-h-0 grow gap-3 overflow-y-auto rounded-2xl border border-white/70 bg-white/60 p-3 shadow-xl lg:grid-cols-[22rem_1fr]">
        <form
          class="space-y-4 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void startTopUp();
          }}
        >
          <div>
            <h2 class="font-semibold text-slate-800">Amount</h2>
            <p class="mt-1 text-sm text-slate-500">
              <Show when={config()} fallback="Loading limits">
                {(value) =>
                  `${formatUsdMicros(value().minTopupUsdMicros)} to ${formatUsdMicros(value().maxTopupUsdMicros)}`
                }
              </Show>
            </p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <For each={presetAmounts}>
              {(amount) => (
                <Button
                  variant="secondary"
                  active={preset() === amount && !customAmount()}
                  class="h-11"
                  onClick={() => {
                    setPreset(amount);
                    setCustomAmount("");
                  }}
                >
                  {formatUsdMicros(dollarsToUsdMicros(amount))}
                </Button>
              )}
            </For>
          </div>
          <label class="block text-xs font-medium text-slate-500">
            Custom amount
            <Input
              type="number"
              min="1"
              step="0.01"
              value={customAmount()}
              disabled={loading()}
              onInput={(event) => setCustomAmount(event.currentTarget.value)}
            />
          </label>
          <div class="rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-600">
            Selected: <strong>{formatUsdMicros(micros())}</strong>
          </div>
          <Button class="w-full" submit disabled={!amountValid()} spinner={starting()}>
            Continue
          </Button>
        </form>
        <div class="min-h-96 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
          <div ref={container} class="min-h-32" />
          <Show when={actions()}>
            <Button class="mt-4 w-full" spinner={confirming()} onClick={() => void confirm()}>
              Pay
            </Button>
          </Show>
          <Show when={message()}>
            {(value) => (
              <div class="text-sky-900 mt-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm">
                {value()}
              </div>
            )}
          </Show>
          <Show when={error()}>
            {(value) => (
              <div class="text-amber-900 mt-4 rounded-xl border border-amber-200 bg-amber-100 px-3 py-2 text-sm">
                {value()}
              </div>
            )}
          </Show>
        </div>
      </section>
    </div>
  );
}
