import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import prisma from "../utils/db";
import { requireUser } from "../utils/hooks";
import { EmptyState } from "../components/EmptyState";
import { InvoiceGraph } from "../components/InvoiceGraph";
import { RecentInvoices } from "../components/RecentInvoices";
import { DashboardBlocks } from "../components/DashboardBlocks";

async function getData(userId: string) {
  const data = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  return data;
}

export default async function DashboardRoute() {
  const session = await requireUser();
  const data = await getData(session.user?.id as string);

  return (
    <>
      {data.length < 1 ? (
        <EmptyState
          title="Belum ada Faktur"
          description="Buat Faktur untuk melihatnya di sini"
          buttontext="Buat Faktur"
          href="/dashboard/invoices/create"
        />
      ) : (
        <Suspense fallback={<Skeleton className="w-full h-full flex-1" />}>
          <div className="flex flex-col gap-4 md:gap-8">
            <DashboardBlocks />
            <div className="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-3">
              <InvoiceGraph />
              <RecentInvoices />
            </div>
          </div>
        </Suspense>
      )}
    </>
  );
}
