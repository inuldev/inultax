import { Activity, CreditCard, Users, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import prisma from "../utils/db";
import { requireUser } from "../utils/hooks";
import { formatCurrency } from "../utils/formatCurrency";

async function getData(userId: string) {
  const [totalInvoices, pendingInvoices, paidInvoices] = await Promise.all([
    // Get all invoices with totals by currency
    prisma.invoice.findMany({
      where: {
        userId: userId,
      },
      select: {
        total: true,
        currency: true,
      },
    }),
    // Get pending invoices with totals by currency
    prisma.invoice.findMany({
      where: {
        userId: userId,
        status: "PENDING",
      },
      select: {
        total: true,
        currency: true,
      },
    }),
    // Get paid invoices with totals by currency
    prisma.invoice.findMany({
      where: {
        userId: userId,
        status: "PAID",
      },
      select: {
        total: true,
        currency: true,
      },
    }),
  ]);

  // Helper function to group totals by currency
  const groupByCurrency = (invoices: { total: number; currency: string }[]) => {
    return invoices.reduce((acc, invoice) => {
      if (!acc[invoice.currency]) {
        acc[invoice.currency] = 0;
      }
      acc[invoice.currency] += invoice.total;
      return acc;
    }, {} as Record<string, number>);
  };

  return {
    totalInvoices,
    totalsByCurrency: groupByCurrency(totalInvoices),
    pendingTotalsByCurrency: groupByCurrency(pendingInvoices),
    paidTotalsByCurrency: groupByCurrency(paidInvoices),
    totalCount: totalInvoices.length,
    pendingCount: pendingInvoices.length,
    paidCount: paidInvoices.length,
  };
}

export async function DashboardBlocks() {
  const session = await requireUser();
  const {
    totalInvoices,
    totalsByCurrency,
    pendingTotalsByCurrency,
    paidTotalsByCurrency,
    totalCount,
    pendingCount,
    paidCount,
  } = await getData(session.user?.id as string);

  const CurrencyTotals = ({ totals }: { totals: Record<string, number> }) => (
    <div className="space-y-1">
      {Object.entries(totals).map(([currency, total]) => {
        // Type guard to ensure only USD or IDR are used
        if (currency !== "USD" && currency !== "IDR") return null;

        return (
          <div key={currency} className="flex justify-between items-center">
            <span className="text-xs font-medium">{currency}:</span>
            <span className="text-sm font-bold">
              {formatCurrency({ amount: total, currency })}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Pendapatan
          </CardTitle>
          <Wallet className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold mb-2">+{totalCount}</h2>
          <CurrencyTotals totals={totalsByCurrency} />
          <p className="text-xs text-muted-foreground">
            Berdasarkan total volume berdasarkan mata uang.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Faktur Diterbitkan
          </CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{totalInvoices.length}</h2>
          <p className="text-xs text-muted-foreground">
            Total faktur yang telah Anda terbitkan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faktur Lunas</CardTitle>
          <CreditCard className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold mb-2">+{paidCount}</h2>
          <CurrencyTotals totals={paidTotalsByCurrency} />
          <p className="text-xs text-muted-foreground">
            Faktur yang telah dibayar!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faktur Tertunda</CardTitle>
          <Activity className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold mb-2">+{pendingCount}</h2>
          <CurrencyTotals totals={pendingTotalsByCurrency} />
          <p className="text-xs text-muted-foreground">
            Faktur yang masih tertunda!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
