import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import prisma from "../utils/db";
import { requireUser } from "../utils/hooks";
import { formatCurrency } from "../utils/formatCurrency";
import { formatIndonesiaDateMedium } from "../utils/dateUtils";

// Utility function untuk menerjemahkan status
const translateStatus = (status: string) => {
  switch (status) {
    case "PAID":
      return "LUNAS";
    case "PENDING":
      return "TERTUNDA";
    default:
      return status;
  }
};

import { EmptyState } from "./EmptyState";
import { InvoiceActions } from "./InvoiceActions";

async function getData(userId: string) {
  const data = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      clientName: true,
      total: true,
      createdAt: true,
      status: true,
      invoiceNumber: true,
      currency: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

export async function InvoiceList() {
  const session = await requireUser();
  const data = await getData(session.user?.id as string);

  return (
    <>
      {data.length === 0 ? (
        <EmptyState
          title="Belum ada faktur"
          description="Buat faktur untuk memulai"
          buttontext="Buat Faktur"
          href="/dashboard/invoices/create"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Faktur</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>#{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>
                  {formatCurrency({
                    amount: invoice.total,
                    currency: invoice.currency as "USD" | "IDR",
                  })}
                </TableCell>
                <TableCell>
                  <Badge>{translateStatus(invoice.status)}</Badge>
                </TableCell>
                <TableCell>
                  {formatIndonesiaDateMedium(invoice.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <InvoiceActions status={invoice.status} id={invoice.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
