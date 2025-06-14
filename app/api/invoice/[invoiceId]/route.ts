import jsPDF from "jspdf";
import { NextResponse } from "next/server";

import prisma from "@/app/utils/db";
import { formatCurrency } from "@/app/utils/formatCurrency";

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
      invoiceItemDescription: true,
      invoiceItemQuantity: true,
      invoiceItemRate: true,
      total: true,
      note: true,
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Konstanta untuk spacing dan line height
  const LINE_HEIGHT = 4; // mm per baris
  const SECTION_SPACING = 10; // mm antar section

  // set font
  pdf.setFont("helvetica");

  //set header
  pdf.setFontSize(24);
  pdf.text(data.invoiceName, 20, 20);

  // From Section dengan text wrapping
  pdf.setFontSize(12);
  pdf.text("From", 20, 40);
  pdf.setFontSize(10);

  // Handle long address with text wrapping
  const maxFromWidth = 80; // mm
  const fromAddressLines = pdf.splitTextToSize(data.fromAddress, maxFromWidth);
  const fromLines = [data.fromName, data.fromEmail, ...fromAddressLines];

  fromLines.forEach((line: string, index: number) => {
    pdf.text(line, 20, 45 + index * LINE_HEIGHT);
  });

  const fromSectionHeight = fromLines.length * LINE_HEIGHT;

  // Client Section dengan text wrapping
  const clientSectionY = 40 + fromSectionHeight + SECTION_SPACING;
  pdf.setFontSize(12);
  pdf.text("Bill to", 20, clientSectionY);
  pdf.setFontSize(10);

  // Handle long client address with text wrapping
  const maxClientWidth = 80; // mm
  const clientAddressLines = pdf.splitTextToSize(
    data.clientAddress,
    maxClientWidth
  );
  const clientLines = [
    data.clientName,
    data.clientEmail,
    ...clientAddressLines,
  ];

  clientLines.forEach((line: string, index: number) => {
    pdf.text(line, 20, clientSectionY + 5 + index * LINE_HEIGHT);
  });

  // Invoice details (kanan atas)
  pdf.setFontSize(10);
  pdf.text(`Invoice Number: #${data.invoiceNumber}`, 120, 40);
  pdf.text(
    `Date: ${new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
    }).format(data.date)}`,
    120,
    45
  );
  pdf.text(`Due Date: Net ${data.dueDate}`, 120, 50);

  // Hitung posisi table berdasarkan tinggi client section
  const clientSectionHeight = clientLines.length * LINE_HEIGHT;
  const tableStartY = Math.max(
    clientSectionY + 5 + clientSectionHeight + SECTION_SPACING,
    60 // minimum Y position
  );

  // Item table header
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("Description", 20, tableStartY);
  pdf.text("Quantity", 100, tableStartY);
  pdf.text("Rate", 130, tableStartY);
  pdf.text("Total", 160, tableStartY);

  // draw header line
  pdf.line(20, tableStartY + 2, 190, tableStartY + 2);

  // Item Details
  pdf.setFont("helvetica", "normal");
  const itemRowY = tableStartY + SECTION_SPACING;

  // Handle long description with text wrapping
  const maxDescriptionWidth = 75; // mm, lebar maksimum untuk kolom deskripsi
  const descriptionLines = pdf.splitTextToSize(
    data.invoiceItemDescription,
    maxDescriptionWidth
  );

  // Hitung tinggi yang dibutuhkan untuk deskripsi
  const descriptionHeight = descriptionLines.length * LINE_HEIGHT;

  // Tampilkan deskripsi dengan multiple lines
  pdf.text(descriptionLines, 20, itemRowY);

  // Posisikan elemen lain sejajar dengan baris pertama deskripsi
  pdf.text(data.invoiceItemQuantity.toString(), 100, itemRowY);
  pdf.text(
    formatCurrency({
      amount: data.invoiceItemRate,
      currency: data.currency as "USD" | "IDR",
    }),
    130,
    itemRowY
  );
  pdf.text(
    formatCurrency({
      amount: data.total,
      currency: data.currency as "USD" | "IDR",
    }),
    160,
    itemRowY
  );

  // Total Section - sesuaikan posisi berdasarkan tinggi deskripsi
  const totalSectionY = itemRowY + descriptionHeight + SECTION_SPACING;
  pdf.line(20, totalSectionY, 190, totalSectionY);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Total (${data.currency})`, 130, totalSectionY + 15);
  pdf.text(
    formatCurrency({
      amount: data.total,
      currency: data.currency as "USD" | "IDR",
    }),
    160,
    totalSectionY + 15
  );

  // Additional Note - sesuaikan posisi dengan line height konsisten
  if (data.note) {
    const noteY = totalSectionY + 30; // spacing dari total section
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Note:", 20, noteY);

    // Handle long note with text wrapping dan line height konsisten
    const maxNoteWidth = 170; // mm, lebar maksimum untuk note
    const noteLines = pdf.splitTextToSize(data.note, maxNoteWidth);

    // Tampilkan note dengan line height yang konsisten
    noteLines.forEach((line: string, index: number) => {
      pdf.text(line, 20, noteY + 5 + index * LINE_HEIGHT);
    });
  }

  // generate pdf as buffer
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  //return pdf as download
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
