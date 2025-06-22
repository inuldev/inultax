import { BasePdfTemplate } from "./base-template";

export class CreativeColorfulTemplate extends BasePdfTemplate {
  renderHeader(): void {
    // Gradient-like header dengan multiple colors
    this.pdf.setFillColor(138, 43, 226); // Purple
    this.pdf.rect(0, 0, 210, 15, "F");
    this.pdf.setFillColor(75, 0, 130); // Indigo
    this.pdf.rect(0, 15, 210, 15, "F");
    this.pdf.setFillColor(0, 191, 255); // Deep sky blue
    this.pdf.rect(0, 30, 210, 10, "F");

    // Creative company name dengan shadow effect
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(28);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(this.data.invoiceName, 22, 27); // Shadow
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text(this.data.invoiceName, 20, 25); // Main text

    // Creative invoice badge
    this.pdf.setFillColor(255, 20, 147); // Deep pink
    this.pdf.rect(140, 8, 55, 15, "F");
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text("✨ INVOICE ✨", 167, 17, { align: "center" });
  }

  renderFromSection(): void {
    const fromBoxY = 55;

    // Colorful gradient box
    this.pdf.setFillColor(255, 182, 193); // Light pink
    this.pdf.rect(15, fromBoxY, 85, 35, "F");

    // Decorative border
    this.pdf.setDrawColor(255, 20, 147); // Deep pink
    this.pdf.setLineWidth(1);
    this.pdf.rect(15, fromBoxY, 85, 35, "D");

    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(138, 43, 226); // Purple
    this.pdf.text("💼 FROM", 20, fromBoxY + 8);

    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(75, 0, 130); // Indigo

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
    const clientBoxY = 55;

    // Colorful gradient box
    this.pdf.setFillColor(173, 216, 230); // Light blue
    this.pdf.rect(110, clientBoxY, 85, 35, "F");

    // Decorative border
    this.pdf.setDrawColor(0, 191, 255); // Deep sky blue
    this.pdf.setLineWidth(1);
    this.pdf.rect(110, clientBoxY, 85, 35, "D");

    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(0, 100, 0); // Dark green
    this.pdf.text("🎯 TO", 115, clientBoxY + 8);

    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(25, 25, 112); // Midnight blue

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
    // Creative details dengan colorful boxes
    const detailsY = 100;

    // Invoice number box
    this.pdf.setFillColor(255, 215, 0); // Gold
    this.pdf.rect(15, detailsY, 40, 15, "F");
    this.pdf.setTextColor(139, 69, 19); // Saddle brown
    this.pdf.setFontSize(8);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text("📄 INVOICE #", 17, detailsY + 5);
    this.pdf.text(`${this.data.invoiceNumber}`, 17, detailsY + 10);

    // Date box
    this.pdf.setFillColor(144, 238, 144); // Light green
    this.pdf.rect(60, detailsY, 45, 15, "F");
    this.pdf.setTextColor(0, 100, 0); // Dark green
    this.pdf.text("📅 DATE", 62, detailsY + 5);
    this.pdf.text(this.formatDate(this.data.date), 62, detailsY + 10);

    // Due date box
    this.pdf.setFillColor(255, 160, 122); // Light salmon
    this.pdf.rect(110, detailsY, 40, 15, "F");
    this.pdf.setTextColor(220, 20, 60); // Crimson
    this.pdf.text("⏰ DUE", 112, detailsY + 5);
    this.pdf.text(`${this.data.dueDate} days`, 112, detailsY + 10);

    // Currency box
    this.pdf.setFillColor(221, 160, 221); // Plum
    this.pdf.rect(155, detailsY, 40, 15, "F");
    this.pdf.setTextColor(128, 0, 128); // Purple
    this.pdf.text("💰 CURRENCY", 157, detailsY + 5);
    this.pdf.text(this.data.currency, 157, detailsY + 10);
  }

  renderTable(): void {
    const tableStartY = 130;

    // Rainbow table header
    this.pdf.setFillColor(255, 99, 71); // Tomato
    this.pdf.rect(15, tableStartY - 5, 45, 12, "F");
    this.pdf.setFillColor(255, 215, 0); // Gold
    this.pdf.rect(60, tableStartY - 5, 45, 12, "F");
    this.pdf.setFillColor(50, 205, 50); // Lime green
    this.pdf.rect(105, tableStartY - 5, 45, 12, "F");
    this.pdf.setFillColor(30, 144, 255); // Dodger blue
    this.pdf.rect(150, tableStartY - 5, 45, 12, "F");

    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text("📝 DESCRIPTION", 20, tableStartY);
    this.pdf.text("🔢 QTY", 65, tableStartY);
    this.pdf.text("💵 RATE", 110, tableStartY);
    this.pdf.text("💎 TOTAL", 155, tableStartY);

    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont("helvetica", "normal");
    let currentY = tableStartY + 10;

    // Creative color palette untuk items
    const itemColors: [number, number, number][] = [
      [255, 240, 245], // Lavender blush
      [240, 248, 255], // Alice blue
      [245, 255, 250], // Mint cream
      [255, 250, 240], // Floral white
      [248, 248, 255], // Ghost white
    ];

    this.data.items.forEach((item, index) => {
      const colorIndex = index % itemColors.length;
      this.pdf.setFillColor(...itemColors[colorIndex]);

      const maxDescriptionWidth = 75;
      const descriptionLines = this.wrapText(
        item.description,
        maxDescriptionWidth
      );
      const itemHeight = this.calculateItemHeight(
        item.description,
        maxDescriptionWidth
      );

      this.pdf.rect(15, currentY - 3, 180, itemHeight + 6, "F");

      // Colorful borders
      this.pdf.setDrawColor(255, 20, 147); // Deep pink
      this.pdf.setLineWidth(0.3);
      this.pdf.rect(15, currentY - 3, 180, itemHeight + 6, "D");

      this.pdf.setFontSize(9);
      this.pdf.text(descriptionLines, 20, currentY + 2);
      this.pdf.text(item.quantity.toString(), 65, currentY + 2);
      this.pdf.text(this.formatCurrency(item.rate), 110, currentY + 2);

      this.pdf.setFont("helvetica", "bold");
      this.pdf.setTextColor(255, 20, 147); // Deep pink
      this.pdf.text(
        this.formatCurrency(item.quantity * item.rate),
        155,
        currentY + 2
      );
      this.pdf.setFont("helvetica", "normal");
      this.pdf.setTextColor(0, 0, 0);

      currentY += itemHeight + 4;
    });
  }

  renderTotal(): void {
    const totalSectionY =
      130 + 10 + this.data.items.length * 20 + this.SECTION_SPACING;

    // Creative total dengan gradient effect
    this.pdf.setFillColor(255, 20, 147); // Deep pink
    this.pdf.rect(100, totalSectionY, 95, 20, "F");

    // Decorative elements
    this.pdf.setFillColor(255, 215, 0); // Gold accent
    this.pdf.rect(100, totalSectionY, 95, 3, "F");
    this.pdf.rect(100, totalSectionY + 17, 95, 3, "F");

    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text("🎉 GRAND TOTAL", 105, totalSectionY + 8);
    this.pdf.setFontSize(16);
    this.pdf.text(
      this.formatCurrency(this.data.total),
      105,
      totalSectionY + 15
    );
  }

  renderNote(): void {
    if (!this.data.note) return;

    const noteY =
      130 + 10 + this.data.items.length * 20 + this.SECTION_SPACING + 35;

    // Creative note box dengan pattern
    this.pdf.setFillColor(255, 248, 220); // Cornsilk
    this.pdf.rect(15, noteY, 180, 25, "F");

    // Decorative border
    this.pdf.setDrawColor(255, 140, 0); // Dark orange
    this.pdf.setLineWidth(1);
    this.pdf.rect(15, noteY, 180, 25, "D");

    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(255, 140, 0); // Dark orange
    this.pdf.text("📝 SPECIAL NOTES", 20, noteY + 8);

    const maxNoteWidth = 165;
    const noteLines = this.wrapText(this.data.note, maxNoteWidth);

    this.pdf.setFont("helvetica", "normal");
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(139, 69, 19); // Saddle brown
    noteLines.forEach((line: string, index: number) => {
      this.pdf.text(line, 20, noteY + 13 + index * this.LINE_HEIGHT);
    });
  }

  renderFooter(): void {
    const footerY = 270;

    // Creative footer dengan rainbow line
    const colors: [number, number, number][] = [
      [255, 0, 0], // Red
      [255, 165, 0], // Orange
      [255, 255, 0], // Yellow
      [0, 128, 0], // Green
      [0, 0, 255], // Blue
      [75, 0, 130], // Indigo
      [238, 130, 238], // Violet
    ];

    colors.forEach((color, index) => {
      this.pdf.setFillColor(...color);
      this.pdf.rect(15 + index * 25, footerY, 25, 3, "F");
    });

    this.pdf.setFontSize(8);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(138, 43, 226); // Purple
    this.pdf.text(
      "🌟 Thank you for your amazing business! 🌟",
      20,
      footerY + 10
    );
    this.pdf.text(
      `✨ Created with love by InulTax - ${new Date().getFullYear()} ✨`,
      20,
      footerY + 15
    );

    this.pdf.setTextColor(255, 20, 147); // Deep pink
    this.pdf.text("📧 " + this.data.fromEmail, 120, footerY + 10);
    this.pdf.text("🤖 Auto-generated with creative flair!", 120, footerY + 15);
  }
}
