import { createSignal } from "solid-js";
import { PaymentOverviewDocument } from "~/gql/graphql";
import type { WalletBalanceData } from "~/lib/feature/payment/payment-display";
import { graphqlClient } from "~/lib/graphql/client";

export const [paymentBalance, setPaymentBalance] = createSignal<WalletBalanceData | null>(null);
export const [paymentLoading, setPaymentLoading] = createSignal(false);
export const [paymentLoadingError, setPaymentLoadingError] = createSignal<string | null>(null);

export async function loadPaymentOverview(): Promise<void> {
  setPaymentLoading(true);
  try {
    const response = await graphqlClient.query(PaymentOverviewDocument, {}, { requestPolicy: "network-only" });
    if (response.error || !response.data) {
      setPaymentBalance(null);
      setPaymentLoadingError("Could not load payment balance.");
      return;
    }
    setPaymentBalance(response.data.walletBalance);
    setPaymentLoadingError(null);
  } catch {
    setPaymentBalance(null);
    setPaymentLoadingError("Could not load payment balance.");
  } finally {
    setPaymentLoading(false);
  }
}
