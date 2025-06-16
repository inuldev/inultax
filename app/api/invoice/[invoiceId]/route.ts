import jsPDF from "jspdf";
import { NextResponse } from "next/server";

import prisma from "@/app/utils/db";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { formatIndonesiaDate } from "@/app/utils/dateUtils";

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

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Konstanta untuk spacing dan line height (dioptimasi)
  const LINE_HEIGHT = 4; // mm per baris (dikurangi dari 4.5)
  const SECTION_SPACING = 10; // mm antar section (dikurangi dari 12)

  // set font
  pdf.setFont("helvetica");

  // Modern Header dengan background
  pdf.setFillColor(41, 128, 185); // Blue background
  pdf.rect(0, 0, 210, 35, "F"); // Header background

  // Company/Invoice name
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.invoiceName, 20, 22);

  // Invoice status badge
  pdf.setFillColor(46, 204, 113); // Green badge
  pdf.rect(150, 8, 40, 8, "F");
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("INVOICE", 170, 13, { align: "center" });

  // Reset text color untuk content
  pdf.setTextColor(52, 73, 94); // Dark gray text

  // From Section dengan modern box styling
  const fromBoxY = 45;
  pdf.setFillColor(236, 240, 241); // Light gray background
  pdf.rect(15, fromBoxY, 85, 35, "F");

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
  pdf.rect(110, clientBoxY, 85, 35, "F");

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
  pdf.rect(110, 20, 85, 20, "FD");

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(52, 73, 94);
  pdf.text(`No. Faktur: #${data.invoiceNumber}`, 115, 26);
  pdf.text(`Tanggal: ${formatIndonesiaDate(data.date)}`, 115, 30);
  pdf.text(`Jatuh Tempo: ${data.dueDate} hari`, 115, 34);

  // Modern Table dengan styling
  const tableStartY = 95;

  // Table header dengan background
  pdf.setFillColor(41, 128, 185); // Blue background
  pdf.rect(15, tableStartY - 5, 180, 12, "F");

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255); // White text
  pdf.text("DESKRIPSI", 20, tableStartY);
  pdf.text("QTY", 105, tableStartY);
  pdf.text("BIAYA/HARGA", 130, tableStartY);
  pdf.text("TOTAL", 165, tableStartY);

  // Reset text color untuk content
  pdf.setTextColor(52, 73, 94);

  // Item Details dengan background alternating
  pdf.setFont("helvetica", "normal");
  let currentY = tableStartY + 10;

  data.items.forEach((item, index) => {
    // Item row background (alternating colors)
    pdf.setFillColor(index % 2 === 0 ? 248 : 255, 249, 250); // Very light gray alternating

    // Handle long description with text wrapping
    const maxDescriptionWidth = 75; // mm
    const descriptionLines = pdf.splitTextToSize(
      item.description,
      maxDescriptionWidth
    );

    // Hitung tinggi yang dibutuhkan untuk deskripsi (lebih dinamis)
    const minItemHeight = 8; // Tinggi minimum untuk 1 baris (lebih kecil)
    const itemHeight = Math.max(
      descriptionLines.length * LINE_HEIGHT,
      minItemHeight
    );

    // Background untuk item ini
    pdf.rect(15, currentY - 3, 180, itemHeight + 6, "F");

    // Tampilkan deskripsi dengan multiple lines
    pdf.setFontSize(10);
    pdf.text(descriptionLines, 20, currentY + 2);

    // Posisikan elemen lain sejajar dengan baris pertama deskripsi
    pdf.text(item.quantity.toString(), 105, currentY + 2);
    pdf.text(
      formatCurrency({
        amount: item.rate,
        currency: data.currency as "USD" | "IDR",
      }),
      130,
      currentY + 2
    );
    pdf.setFont("helvetica", "bold");
    pdf.text(
      formatCurrency({
        amount: item.quantity * item.rate,
        currency: data.currency as "USD" | "IDR",
      }),
      165,
      currentY + 2
    );
    pdf.setFont("helvetica", "normal");

    currentY += itemHeight + 4; // Reduced space between items
  });

  // Modern Total Section dengan highlight
  const totalSectionY = currentY + SECTION_SPACING;

  // Total box dengan accent color
  pdf.setFillColor(46, 204, 113); // Green background
  pdf.rect(120, totalSectionY, 75, 15, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255); // White text

  // Tampilkan label dan nilai dalam satu baris
  const totalText = `TOTAL (${data.currency}): ${formatCurrency({
    amount: data.total,
    currency: data.currency as "USD" | "IDR",
  })}`;

  pdf.text(totalText, 125, totalSectionY + 9);

  // Reset text color
  pdf.setTextColor(52, 73, 94);

  // Modern Note Section
  if (data.note) {
    const noteY = totalSectionY + 25;

    // Note box dengan border
    pdf.setDrawColor(41, 128, 185); // Blue border
    pdf.setFillColor(248, 249, 250); // Light background
    pdf.rect(15, noteY, 180, 25, "FD");

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
