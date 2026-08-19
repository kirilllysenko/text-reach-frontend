import { PaymentOverviewStore } from "$houdini";
import type { WalletBalanceData } from "./payment-display";

export class PaymentOverviewState {
  private readonly paymentOverviewQuery = new PaymentOverviewStore();
  balance = $state<WalletBalanceData | null>(null);
  loading = $state(false);
  loadingError = $state<string | null>(null);

  load = async (): Promise<void> => {
    this.loading = true;

    try {
      const response = await this.paymentOverviewQuery.fetch();

      if (response.errors || !response.data) {
        this.handleResponseError();
        return;
      }

      this.balance = response.data.walletBalance;
      this.loadingError = null;
    } catch {
      this.handleResponseError();
    } finally {
      this.loading = false;
    }
  };

  private handleResponseError(): void {
    this.loadingError = "Could not load payment balance.";
    this.balance = null;
  }
}
