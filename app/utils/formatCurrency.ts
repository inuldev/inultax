interface iAppProps {
  amount: number;
  currency: "USD" | "IDR";
}

export function formatCurrency({ amount, currency }: iAppProps) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
