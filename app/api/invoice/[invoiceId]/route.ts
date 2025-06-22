import { NextResponse } from "next/server";

import prisma from "@/app/utils/db";
import { InvoiceData } from "@/app/utils/pdf-templates/base-template";
import {
  PdfTemplateFactory,
  PdfTemplateType,
} from "@/app/utils/pdf-templates/template-factory";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  const { invoiceId } = await params;

  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      invoiceName: true,
      invoiceNumber: true,
      currency: true,
      fromName: true,
      fromEmail: true,
      fromAddress: true,
      clientName: true,
      clientAddress: true,
      clientEmail: true,
      date: true,
      dueDate: true,
      total: true,
      note: true,
      pdfTemplate: true,
      items: {
        select: {
          description: true,
          quantity: true,
          rate: true,
        },
      },
    },
  });

  if (!data) {
    return NextResponse.json(
      { error: "Faktur tidak ditemukan" },
      { status: 404 }
    );
  }

  // Prepare data untuk template
  const invoiceData: InvoiceData = {
    invoiceName: data.invoiceName,
    invoiceNumber: data.invoiceNumber,
    currency: data.currency,
    fromName: data.fromName,
    fromEmail: data.fromEmail,
    fromAddress: data.fromAddress,
    clientName: data.clientName,
    clientAddress: data.clientAddress,
    clientEmail: data.clientEmail,
    date: data.date,
    dueDate: data.dueDate,
    total: data.total,
    note: data.note || undefined,
    items: data.items,
  };

  // Generate PDF menggunakan template yang dipilih
  const templateType = (data.pdfTemplate as PdfTemplateType) || "MODERN_BLUE";
  const template = PdfTemplateFactory.createTemplate(templateType, invoiceData);
  const pdfBuffer = template.generate();

  //return pdf as download
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
