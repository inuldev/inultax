import { BasePdfTemplate } from "./base-template";

export class ProfessionalDarkTemplate extends BasePdfTemplate {
  renderHeader(): void {
    // Dark professional header
    this.pdf.setFillColor(33, 37, 41); // Dark background
    this.pdf.rect(0, 0, 210, 40, "F");

    // Company name dengan accent
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(26);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(this.data.invoiceName, 20, 25);

    // Accent line
    this.pdf.setFillColor(220, 53, 69); // Red accent
    this.pdf.rect(0, 35, 210, 5, "F");

    // Invoice badge - dark theme
    this.pdf.setFillColor(52, 58, 64); // Dark gray
    this.pdf.rect(145, 10, 50, 12, "F");
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(11);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text("INVOICE", 170, 18, { align: "center" });
  }

  renderFromSection(): void {
    const fromBoxY = 55;

    // Dark box untuk from section
    this.pdf.setFillColor(248, 249, 250); // Light background
    this.pdf.setDrawColor(33, 37, 41); // Dark border
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(15, fromBoxY, 85, 35, "FD");

    this.pdf.setFontSize(11);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(220, 53, 69); // Red accent
    this.pdf.text("BILL FROM", 20, fromBoxY + 8);

    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(33, 37, 41); // Dark text

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

    // Dark box untuk client section
    this.pdf.setFillColor(248, 249, 250); // Light background
    this.pdf.setDrawColor(33, 37, 41); // Dark border
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(110, clientBoxY, 85, 35, "FD");

    this.pdf.setFontSize(11);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(220, 53, 69); // Red accent
    this.pdf.text("BILL TO", 115, clientBoxY + 8);

    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(33, 37, 41); // Dark text

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
    // Professional details box
    this.pdf.setFillColor(33, 37, 41); // Dark background
    this.pdf.rect(15, 100, 180, 20, "F");

    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(255, 255, 255); // White text

    // Grid layout untuk details
    this.pdf.text("Invoice #:", 20, 108);
    this.pdf.text(`${this.data.invoiceNumber}`, 20, 113);

    this.pdf.text("Issue Date:", 70, 108);
    this.pdf.text(this.formatDate(this.data.date), 70, 113);

    this.pdf.text("Due Date:", 120, 108);
    this.pdf.text(`${this.data.dueDate} days`, 120, 113);

    this.pdf.text("Currency:", 170, 108);
    this.pdf.text(this.data.currency, 170, 113);
  }

  renderTable(): void {
    const tableStartY = 135;

    // Professional table header
    this.pdf.setFillColor(52, 58, 64); // Dark gray
    this.pdf.rect(15, tableStartY - 5, 180, 12, "F");

    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(255, 255, 255); // White text
    this.pdf.text("DESCRIPTION", 20, tableStartY);
    this.pdf.text("QTY", 105, tableStartY);
    this.pdf.text("RATE", 130, tableStartY);
    this.pdf.text("AMOUNT", 165, tableStartY);

    this.pdf.setTextColor(33, 37, 41); // Dark text
    this.pdf.setFont("helvetica", "normal");
    let currentY = tableStartY + 10;

    this.data.items.forEach((item, index) => {
      // Professional alternating rows
      if (index % 2 === 0) {
        this.pdf.setFillColor(248, 249, 250); // Light gray
      } else {
        this.pdf.setFillColor(255, 255, 255); // White
      }

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

      // Add subtle borders
      this.pdf.setDrawColor(222, 226, 230);
      this.pdf.setLineWidth(0.2);
      this.pdf.line(15, currentY - 3, 195, currentY - 3);

      this.pdf.setFontSize(9);
      this.pdf.text(descriptionLines, 20, currentY + 2);
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

    // Bottom border
    this.pdf.setDrawColor(33, 37, 41);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(15, currentY, 195, currentY);
  }

  renderTotal(): void {
    const totalSectionY =
      135 + 10 + this.data.items.length * 20 + this.SECTION_SPACING;

    // Professional total section
    this.pdf.setFillColor(220, 53, 69); // Red accent
    this.pdf.rect(110, totalSectionY, 85, 18, "F");

    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(13);
    this.pdf.setTextColor(255, 255, 255); // White text

    this.pdf.text("TOTAL", 115, totalSectionY + 7);
    this.pdf.text(
      this.formatCurrency(this.data.total),
      115,
      totalSectionY + 13
    );

    // Currency label
    this.pdf.setFontSize(9);
    this.pdf.text(`(${this.data.currency})`, 170, totalSectionY + 13);
  }

  renderNote(): void {
    if (!this.data.note) return;

    const noteY =
      135 + 10 + this.data.items.length * 20 + this.SECTION_SPACING + 30;

    // Professional note box
    this.pdf.setFillColor(248, 249, 250); // Light background
    this.pdf.setDrawColor(33, 37, 41); // Dark border
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(15, noteY, 180, 25, "FD");

    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(220, 53, 69); // Red accent
    this.pdf.text("NOTES", 20, noteY + 8);

    const maxNoteWidth = 165;
    const noteLines = this.wrapText(this.data.note, maxNoteWidth);

    this.pdf.setFont("helvetica", "normal");
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(33, 37, 41);
    noteLines.forEach((line: string, index: number) => {
      this.pdf.text(line, 20, noteY + 13 + index * this.LINE_HEIGHT);
    });
  }

  renderFooter(): void {
    const footerY = 275;

    // Professional footer dengan dark theme
    this.pdf.setFillColor(33, 37, 41); // Dark background
    this.pdf.rect(0, footerY - 5, 210, 25, "F");

    this.pdf.setFontSize(8);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(255, 255, 255); // White text
    this.pdf.text("Thank you for choosing our services!", 20, footerY + 5);
    this.pdf.text(
      `© ${new Date().getFullYear()} InulTax - Professional Invoice Management`,
      20,
      footerY + 10
    );

    this.pdf.text("Contact: " + this.data.fromEmail, 120, footerY + 5);
    this.pdf.text(
      "This document was generated automatically",
      120,
      footerY + 10
    );
  }
}
