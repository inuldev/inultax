import { BasePdfTemplate } from "./base-template";

export class ClassicMinimalTemplate extends BasePdfTemplate {
  renderHeader(): void {
    // Simple header dengan garis
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(15, 30, 195, 30);

    // Company name - simple dan elegant
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(24);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(this.data.invoiceName, 20, 25);

    // Invoice label - minimal
    this.pdf.setFontSize(14);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.text("INVOICE", 170, 25);
  }

  renderFromSection(): void {
    const fromY = 45;

    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text("FROM:", 20, fromY);

    this.pdf.setFont("helvetica", "normal");
    const fromLines = [
      this.data.fromName,
      this.data.fromEmail,
      ...this.wrapText(this.data.fromAddress, 80),
    ];

    fromLines.forEach((line: string, index: number) => {
      this.pdf.text(line, 20, fromY + 5 + index * this.LINE_HEIGHT);
    });
  }

  renderClientSection(): void {
    const clientY = 45;

    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text("TO:", 110, clientY);

    this.pdf.setFont("helvetica", "normal");
    const clientLines = [
      this.data.clientName,
      this.data.clientEmail,
      ...this.wrapText(this.data.clientAddress, 80),
    ];

    clientLines.forEach((line: string, index: number) => {
      this.pdf.text(line, 110, clientY + 5 + index * this.LINE_HEIGHT);
    });
  }

  renderInvoiceDetails(): void {
    const detailsY = 80;

    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(0, 0, 0);

    // Simple table untuk invoice details
    this.pdf.text("Invoice Number:", 20, detailsY);
    this.pdf.text(`#${this.data.invoiceNumber}`, 60, detailsY);

    this.pdf.text("Date:", 20, detailsY + 5);
    this.pdf.text(this.formatDate(this.data.date), 60, detailsY + 5);

    this.pdf.text("Due Date:", 20, detailsY + 10);
    this.pdf.text(`${this.data.dueDate} days`, 60, detailsY + 10);
  }

  renderTable(): void {
    const tableStartY = 110;

    // Simple table header dengan garis
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(15, tableStartY - 2, 195, tableStartY - 2);
    this.pdf.line(15, tableStartY + 8, 195, tableStartY + 8);

    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text("Description", 20, tableStartY + 3);
    this.pdf.text("Qty", 105, tableStartY + 3);
    this.pdf.text("Rate", 130, tableStartY + 3);
    this.pdf.text("Amount", 165, tableStartY + 3);

    this.pdf.setFont("helvetica", "normal");
    let currentY = tableStartY + 15;

    this.data.items.forEach((item, index) => {
      const maxDescriptionWidth = 75;
      const descriptionLines = this.wrapText(
        item.description,
        maxDescriptionWidth
      );
      const itemHeight = this.calculateItemHeight(
        item.description,
        maxDescriptionWidth
      );

      // Simple alternating background
      if (index % 2 === 0) {
        this.pdf.setFillColor(250, 250, 250);
        this.pdf.rect(15, currentY - 2, 180, itemHeight + 4, "F");
      }

      this.pdf.setFontSize(9);
      this.pdf.text(descriptionLines, 20, currentY + 1);
      this.pdf.text(item.quantity.toString(), 105, currentY + 1);
      this.pdf.text(this.formatCurrency(item.rate), 130, currentY + 1);
      this.pdf.text(
        this.formatCurrency(item.quantity * item.rate),
        165,
        currentY + 1
      );

      currentY += itemHeight + 5;
    });

    // Bottom line
    this.pdf.line(15, currentY, 195, currentY);
  }

  renderTotal(): void {
    const totalY = 110 + 15 + this.data.items.length * 15 + 10;

    // Simple total section
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(120, totalY - 2, 195, totalY - 2);

    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text("TOTAL:", 130, totalY + 5);
    this.pdf.text(this.formatCurrency(this.data.total), 165, totalY + 5);

    this.pdf.line(120, totalY + 8, 195, totalY + 8);
  }

  renderNote(): void {
    if (!this.data.note) return;

    const noteY = 110 + 15 + this.data.items.length * 15 + 30;

    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text("Notes:", 20, noteY);

    const maxNoteWidth = 170;
    const noteLines = this.wrapText(this.data.note, maxNoteWidth);

    this.pdf.setFont("helvetica", "normal");
    this.pdf.setFontSize(9);
    noteLines.forEach((line: string, index: number) => {
      this.pdf.text(line, 20, noteY + 5 + index * this.LINE_HEIGHT);
    });
  }

  renderFooter(): void {
    const footerY = 270;

    // Simple footer dengan garis
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(15, footerY, 195, footerY);

    this.pdf.setFontSize(8);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text("Thank you for your business!", 20, footerY + 8);
    this.pdf.text(
      `Generated by InulTax - ${new Date().getFullYear()}`,
      20,
      footerY + 12
    );

    this.pdf.text("Contact: " + this.data.fromEmail, 120, footerY + 8);
  }
}
