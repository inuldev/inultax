import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import prisma from "../utils/db";
import { requireUser } from "../utils/hooks";
import { formatCurrency } from "../utils/formatCurrency";

async function getData(userId: string) {
  const data = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      clientName: true,
      clientEmail: true,
      total: true,
      currency: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 7,
  });

  return data;
}

export async function RecentInvoices() {
  const session = await requireUser();
  const data = await getData(session.user?.id as string);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faktur Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {data.map((item) => (
          <div
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 min-w-0"
            key={item.id}
          >
            <Avatar className="hidden sm:flex size-9 flex-shrink-0">
              <AvatarFallback>{item.clientName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
              <p
                className="text-sm font-medium leading-none truncate"
                title={item.clientName}
              >
                {item.clientName}
              </p>
              <p
                className="text-sm text-muted-foreground truncate"
                title={item.clientEmail}
              >
                {item.clientEmail}
              </p>
            </div>
            <div className="font-medium text-sm flex-shrink-0 text-right">
              <span className="text-green-600">+</span>
              <span className="ml-1">
                {formatCurrency({
                  amount: item.total,
                  currency: item.currency as "USD" | "IDR",
                })}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
