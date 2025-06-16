import { NextResponse } from "next/server";

import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { sendReminderEmail } from "@/app/utils/nodemailer";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { formatIndonesiaDate } from "@/app/utils/dateUtils";

export async function POST(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  try {
    const session = await requireUser();

    const { invoiceId } = await params;

    const invoiceData = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user?.id,
      },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        invoiceNumber: true,
        date: true,
        dueDate: true,
        total: true,
        currency: true,
        fromName: true,
        fromEmail: true,
      },
    });

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Hitung tanggal jatuh tempo
    const invoiceDate = new Date(invoiceData.date);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + invoiceData.dueDate);

    // Hitung hari terlambat
    const today = new Date();
    const timeDiff = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    // Kirim email reminder menggunakan nodemailer
    await sendReminderEmail({
      to: invoiceData.clientEmail,
      clientName: invoiceData.clientName,
      invoiceNumber: invoiceData.invoiceNumber.toString(),
      invoiceDueDate: formatIndonesiaDate(dueDate),
      invoiceAmount: formatCurrency({
        amount: invoiceData.total,
        currency: invoiceData.currency as "USD" | "IDR",
      }),
      invoiceLink:
        process.env.NODE_ENV !== "production"
          ? `http://localhost:3000/api/invoice/${invoiceData.id}`
          : `https://inultax.vercel.app/api/invoice/${invoiceData.id}`,
      daysOverdue,
      companyName: "InulTax",
      companyEmail: invoiceData.fromEmail,
      companyPhone: "+62 812-3456-7890", // Bisa diambil dari user profile nanti
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send reminder email:", error);
    return NextResponse.json(
      { error: "Failed to send Email reminder" },
      { status: 500 }
    );
  }
}
