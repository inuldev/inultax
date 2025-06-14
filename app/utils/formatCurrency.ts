interface iAppProps {
  amount: number;
  currency: "USD" | "IDR";
}

export function formatCurrency({ amount, currency }: iAppProps) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
