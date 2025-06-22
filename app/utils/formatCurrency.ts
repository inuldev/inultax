interface iAppProps {
  amount: number;
  currency: "USD" | "IDR";
}

export function formatCurrency({ amount, currency }: iAppProps) {
  // Pilih locale yang sesuai dengan currency
  const locale = currency === "USD" ? "en-US" : "id-ID";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
