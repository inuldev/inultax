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
    return NextResponse.json(
      { error: "Faktur tidak ditemukan" },
      { status: 404 }
    );
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Konstanta untuk spacing dan line height
  const LINE_HEIGHT = 4.5; // mm per baris
  const SECTION_SPACING = 12; // mm antar section

  // set font
  pdf.setFont("helvetica");

  // Modern Header dengan background
  pdf.setFillColor(41, 128, 185); // Blue background
  pdf.rect(0, 0, 210, 35, "I"); // Header background

  // Company/Invoice name
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.invoiceName, 20, 22);

  // Invoice status badge
  pdf.setFillColor(46, 204, 113); // Green badge
  pdf.roundedRect(150, 8, 40, 8, 2, 2, "I");
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("INVOICE", 165, 13);

  // Reset text color untuk content
  pdf.setTextColor(52, 73, 94); // Dark gray text

  // From Section dengan modern box styling
  const fromBoxY = 45;
  pdf.setFillColor(236, 240, 241); // Light gray background
  pdf.roundedRect(15, fromBoxY, 85, 35, 3, 3, "I");

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(41, 128, 185); // Blue header
  pdf.text("DARI", 20, fromBoxY + 8);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(52, 73, 94); // Dark gray text

  // Handle long address with text wrapping
  const maxFromWidth = 75; // mm
  const fromAddressLines = pdf.splitTextToSize(data.fromAddress, maxFromWidth);
  const fromLines = [data.fromName, data.fromEmail, ...fromAddressLines];

  fromLines.forEach((line: string, index: number) => {
    pdf.text(line, 20, fromBoxY + 13 + index * LINE_HEIGHT);
  });

  // Client Section dengan modern box styling
  const clientBoxY = 45;
  pdf.setFillColor(236, 240, 241); // Light gray background
  pdf.roundedRect(110, clientBoxY, 85, 35, 3, 3, "I");

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(41, 128, 185); // Blue header
  pdf.text("KEPADA", 115, clientBoxY + 8);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(52, 73, 94); // Dark gray text

  // Handle long client address with text wrapping
  const maxClientWidth = 75; // mm
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
    pdf.text(line, 115, clientBoxY + 13 + index * LINE_HEIGHT);
  });

  // Invoice details dengan modern styling (kanan atas)
  pdf.setFillColor(255, 255, 255); // White background
  pdf.setDrawColor(41, 128, 185); // Blue border
  pdf.roundedRect(110, 20, 85, 20, 3, 3, "IT");

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(52, 73, 94);
  pdf.text(`No. Faktur: #${data.invoiceNumber}`, 115, 26);
  pdf.text(
    `Tanggal: ${new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(data.date)}`,
    115,
    30
  );
  pdf.text(`Jatuh Tempo: ${data.dueDate} hari`, 115, 34);

  // Modern Table dengan styling
  const tableStartY = 95;

  // Table header dengan background
  pdf.setFillColor(41, 128, 185); // Blue background
  pdf.rect(15, tableStartY - 5, 180, 12, "I");

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255); // White text
  pdf.text("DESKRIPSI", 20, tableStartY);
  pdf.text("QTY", 105, tableStartY);
  pdf.text("HARGA", 130, tableStartY);
  pdf.text("TOTAL", 165, tableStartY);

  // Reset text color untuk content
  pdf.setTextColor(52, 73, 94);

  // Item Details dengan background alternating
  pdf.setFont("helvetica", "normal");
  const itemRowY = tableStartY + 10;

  // Item row background
  pdf.setFillColor(248, 249, 250); // Very light gray
  pdf.rect(15, itemRowY - 3, 180, 20, "I");

  // Handle long description with text wrapping
  const maxDescriptionWidth = 75; // mm
  const descriptionLines = pdf.splitTextToSize(
    data.invoiceItemDescription,
    maxDescriptionWidth
  );

  // Hitung tinggi yang dibutuhkan untuk deskripsi
  const descriptionHeight = Math.max(descriptionLines.length * LINE_HEIGHT, 15);

  // Tampilkan deskripsi dengan multiple lines
  pdf.setFontSize(10);
  pdf.text(descriptionLines, 20, itemRowY + 2);

  // Posisikan elemen lain sejajar dengan baris pertama deskripsi
  pdf.text(data.invoiceItemQuantity.toString(), 105, itemRowY + 2);
  pdf.text(
    formatCurrency({
      amount: data.invoiceItemRate,
      currency: data.currency as "USD" | "IDR",
    }),
    130,
    itemRowY + 2
  );
  pdf.setFont("helvetica", "bold");
  pdf.text(
    formatCurrency({
      amount: data.total,
      currency: data.currency as "USD" | "IDR",
    }),
    165,
    itemRowY + 2
  );

  // Modern Total Section dengan highlight
  const totalSectionY = itemRowY + descriptionHeight + SECTION_SPACING;

  // Total box dengan accent color
  pdf.setFillColor(46, 204, 113); // Green background
  pdf.roundedRect(120, totalSectionY, 75, 15, 3, 3, "I");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255); // White text
  pdf.text(`TOTAL (${data.currency})`, 125, totalSectionY + 6);
  pdf.setFontSize(14);
  pdf.text(
    formatCurrency({
      amount: data.total,
      currency: data.currency as "USD" | "IDR",
    }),
    125,
    totalSectionY + 12
  );

  // Reset text color
  pdf.setTextColor(52, 73, 94);

  // Modern Note Section
  if (data.note) {
    const noteY = totalSectionY + 25;

    // Note box dengan border
    pdf.setDrawColor(41, 128, 185); // Blue border
    pdf.setFillColor(248, 249, 250); // Light background
    pdf.roundedRect(15, noteY, 180, 25, 3, 3, "IT");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(41, 128, 185); // Blue header
    pdf.text("CATATAN", 20, noteY + 8);

    // Handle long note with text wrapping
    const maxNoteWidth = 165;
    const noteLines = pdf.splitTextToSize(data.note, maxNoteWidth);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(52, 73, 94);
    noteLines.forEach((line: string, index: number) => {
      pdf.text(line, 20, noteY + 13 + index * LINE_HEIGHT);
    });
  }

  // Modern Footer
  const footerY = 280; // Near bottom of page
  pdf.setDrawColor(41, 128, 185);
  pdf.line(15, footerY, 195, footerY); // Footer line

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(128, 128, 128); // Gray text
  pdf.text("Terima kasih atas kepercayaan Anda!", 20, footerY + 8);
  pdf.text(
    `Dibuat dengan InulTax - ${new Date().getFullYear()}`,
    20,
    footerY + 12
  );

  // Company info on right
  pdf.text("Email: " + data.fromEmail, 120, footerY + 8);
  pdf.text("Dokumen ini dibuat secara otomatis", 120, footerY + 12);

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
