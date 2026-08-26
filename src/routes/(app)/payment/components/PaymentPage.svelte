<script lang="ts">
  import { onMount } from "svelte";
  import { PaymentOverviewStore } from "$houdini";
  import { PageTitle } from "$lib";
  import { PATH_PAYMENT_TOP_UP, PATH_PAYMENT_TRANSACTION } from "$lib/app/paths";
  import { formatPaymentBalance } from "$lib/feature/payment/payment-display";
  import type { WalletBalanceData } from "$lib/feature/payment/payment-display";

  const paymentOverviewQuery = new PaymentOverviewStore();
  const paymentState = $state({
    balance: null as WalletBalanceData | null,
    loading: false,
    loadingError: null as string | null,
  });

  async function loadPaymentOverview(): Promise<void> {
    paymentState.loading = true;
    try {
      const response = await paymentOverviewQuery.fetch();
      if (response.errors || !response.data) {
        handleResponseError();
        return;
      }
      paymentState.balance = response.data.walletBalance;
      paymentState.loadingError = null;
    } catch {
      handleResponseError();
    } finally {
      paymentState.loading = false;
    }
  }

  function handleResponseError(): void {
    paymentState.loadingError = "Could not load payment balance.";
    paymentState.balance = null;
  }

  onMount(() => {
    void loadPaymentOverview();
  });
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Payments" />

  <section
    class="grid min-h-0 grow grid-cols-1 content-start gap-3 overflow-y-auto rounded-2xl border border-white/70
      bg-white/60 p-3 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md lg:grid-cols-[1fr_22rem]"
  >
    <div class="space-y-3">
      <div class="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Available balance</p>
        <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div id="payment-balance" class="text-4xl font-semibold text-slate-900 sm:text-5xl">
            {paymentState.loading ? "Loading" : formatPaymentBalance(paymentState.balance)}
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <a
              id="payment-top-up-link"
              href={PATH_PAYMENT_TOP_UP}
              class="flex h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-700 px-4
                text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Top up
            </a>
            <a
              id="payment-transactions-link"
              href={PATH_PAYMENT_TRANSACTION}
              class="flex h-10 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-4
                text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
            >
              Transactions
            </a>
          </div>
        </div>

        {#if paymentState.loadingError}
          <div class="text-amber-900 mt-4 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm">
            {paymentState.loadingError}
          </div>
        {/if}
      </div>
    </div>

    <div class="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
      <dl class="space-y-4">
        <div>
          <dt class="text-xs font-medium tracking-[0.04em] text-slate-500 uppercase">Currency</dt>
          <dd id="payment-currency" class="mt-1 text-lg font-semibold text-slate-800">
            {paymentState.balance?.currency ?? "USD"}
          </dd>
        </div>
        <div>
          <dt class="text-xs font-medium tracking-[0.04em] text-slate-500 uppercase">Status</dt>
          <dd id="payment-status" class="mt-1 text-lg font-semibold text-slate-800">
            {paymentState.loadingError ? "Unavailable" : "Ready"}
          </dd>
        </div>
      </dl>
    </div>
  </section>
</div>
