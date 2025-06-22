import { BasePdfTemplate } from "./base-template";

export class ModernBlueTemplate extends BasePdfTemplate {
  renderHeader(): void {
    // Modern Header dengan background biru
    this.pdf.setFillColor(41, 128, 185); // Blue background
    this.pdf.rect(0, 0, 210, 35, "F"); // Header background

    // Company/Invoice name
    this.pdf.setTextColor(255, 255, 255); // White text
    this.pdf.setFontSize(28);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(this.data.invoiceName, 20, 22);

    // Invoice status badge
    this.pdf.setFillColor(46, 204, 113); // Green badge
    this.pdf.rect(150, 8, 40, 8, "F");
    this.pdf.setTextColor(255, 255, 255); // White text
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text("INVOICE", 170, 13, { align: "center" });

    // Reset text color
    this.pdf.setTextColor(52, 73, 94); // Dark gray text
  }

  renderFromSection(): void {
    const fromBoxY = 45;
    this.pdf.setFillColor(236, 240, 241); // Light gray background
    this.pdf.rect(15, fromBoxY, 85, 35, "F");

    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(41, 128, 185); // Blue header
    this.pdf.text("DARI", 20, fromBoxY + 8);

    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(52, 73, 94); // Dark gray text

    const maxFromWidth = 75;
    const fromAddressLines = this.wrapText(this.data.fromAddress, maxFromWidth);
    const fromLines = [
      this.data.fromName,
      this.data.fromEmail,
      ...fromAddressLines,
    ];

    fromLines.forEach((line: string, index: number) => {
      this.pdf.text(line, 20, fromBoxY + 13 + index * this.LINE_HEIGHT);
    });
  }

  renderClientSection(): void {
    const clientBoxY = 45;
    this.pdf.setFillColor(236, 240, 241); // Light gray background
    this.pdf.rect(110, clientBoxY, 85, 35, "F");

    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(41, 128, 185); // Blue header
    this.pdf.text("KEPADA", 115, clientBoxY + 8);

    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(52, 73, 94); // Dark gray text

    const maxClientWidth = 75;
    const clientAddressLines = this.wrapText(
      this.data.clientAddress,
      maxClientWidth
    );
    const clientLines = [
      this.data.clientName,
      this.data.clientEmail,
      ...clientAddressLines,
    ];

    clientLines.forEach((line: string, index: number) => {
      this.pdf.text(line, 115, clientBoxY + 13 + index * this.LINE_HEIGHT);
    });
  }

  renderInvoiceDetails(): void {
    this.pdf.setFillColor(255, 255, 255); // White background
    this.pdf.setDrawColor(41, 128, 185); // Blue border
    this.pdf.rect(110, 20, 85, 20, "FD");

    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(52, 73, 94);
    this.pdf.text(`No. Faktur: #${this.data.invoiceNumber}`, 115, 26);
    this.pdf.text(`Tanggal: ${this.formatDate(this.data.date)}`, 115, 30);
    this.pdf.text(`Jatuh Tempo: ${this.data.dueDate} hari`, 115, 34);
  }

  renderTable(): void {
    const tableStartY = 95;

    // Table header dengan background
    this.pdf.setFillColor(41, 128, 185); // Blue background
    this.pdf.rect(15, tableStartY - 5, 180, 12, "F");

    this.pdf.setFontSize(11);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(255, 255, 255); // White text
    this.pdf.text("DESKRIPSI", 20, tableStartY);
    this.pdf.text("QTY", 105, tableStartY);
    this.pdf.text("BIAYA/HARGA", 130, tableStartY);
    this.pdf.text("TOTAL", 165, tableStartY);

    // Reset text color
    this.pdf.setTextColor(52, 73, 94);
    this.pdf.setFont("helvetica", "normal");
    let currentY = tableStartY + 10;

    this.data.items.forEach((item, index) => {
      // Item row background (alternating colors)
      this.pdf.setFillColor(index % 2 === 0 ? 248 : 255, 249, 250);

      const maxDescriptionWidth = 75;
      const descriptionLines = this.wrapText(
        item.description,
        maxDescriptionWidth
      );
      const itemHeight = this.calculateItemHeight(
        item.description,
        maxDescriptionWidth
      );

      // Background untuk item ini
      this.pdf.rect(15, currentY - 3, 180, itemHeight + 6, "F");

      // Tampilkan deskripsi dengan multiple lines
      this.pdf.setFontSize(10);
      this.pdf.text(descriptionLines, 20, currentY + 2);

      // Posisikan elemen lain
      this.pdf.text(item.quantity.toString(), 105, currentY + 2);
      this.pdf.text(this.formatCurrency(item.rate), 130, currentY + 2);
      this.pdf.setFont("helvetica", "bold");
      this.pdf.text(
        this.formatCurrency(item.quantity * item.rate),
        165,
        currentY + 2
      );
      this.pdf.setFont("helvetica", "normal");

      currentY += itemHeight + 4;
    });
  }

  renderTotal(): void {
    const totalSectionY =
      95 + 10 + this.data.items.length * 20 + this.SECTION_SPACING;

    // Total box dengan accent color
    this.pdf.setFillColor(46, 204, 113); // Green background
    this.pdf.rect(120, totalSectionY, 75, 15, "F");

    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(255, 255, 255); // White text

    const totalText = `TOTAL (${this.data.currency}): ${this.formatCurrency(
      this.data.total
    )}`;
    this.pdf.text(totalText, 125, totalSectionY + 9);

    // Reset text color
    this.pdf.setTextColor(52, 73, 94);
  }

  renderNote(): void {
    if (!this.data.note) return;

    const noteY =
      95 + 10 + this.data.items.length * 20 + this.SECTION_SPACING + 25;

    // Note box dengan border
    this.pdf.setDrawColor(41, 128, 185); // Blue border
    this.pdf.setFillColor(248, 249, 250); // Light background
    this.pdf.rect(15, noteY, 180, 25, "FD");

    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(41, 128, 185); // Blue header
    this.pdf.text("CATATAN", 20, noteY + 8);

    // Handle long note with text wrapping
    const maxNoteWidth = 165;
    const noteLines = this.wrapText(this.data.note, maxNoteWidth);

    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(52, 73, 94);
    noteLines.forEach((line: string, index: number) => {
      this.pdf.text(line, 20, noteY + 13 + index * this.LINE_HEIGHT);
    });
  }

  renderFooter(): void {
    const footerY = 280;
    this.pdf.setDrawColor(41, 128, 185);
    this.pdf.line(15, footerY, 195, footerY);

    this.pdf.setFontSize(8);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(128, 128, 128);
    this.pdf.text("Terima kasih atas kepercayaan Anda!", 20, footerY + 8);
    this.pdf.text(
      `Dibuat dengan InulTax - ${new Date().getFullYear()}`,
      20,
      footerY + 12
    );

    this.pdf.text("Email: " + this.data.fromEmail, 120, footerY + 8);
    this.pdf.text("Dokumen ini dibuat secara otomatis", 120, footerY + 12);
  }
}
