import { NextResponse } from "next/server";

import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { sendReminderEmail } from "@/app/utils/nodemailer";

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
    });

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Kirim email reminder menggunakan nodemailer
    await sendReminderEmail({
      to: invoiceData.clientEmail,
      clientName: invoiceData.clientName,
      companyName: "InulTax",
      companyAddress: "Jalan Fufufafa No. 8",
      companyCity: "Wakanda",
      companyZipCode: "123456",
      companyCountry: "Konoha",
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
