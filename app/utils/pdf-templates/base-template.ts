import jsPDF from "jspdf";
import { formatCurrency } from "../formatCurrency";
import { formatIndonesiaDate } from "../dateUtils";

export interface InvoiceData {
  invoiceName: string;
  invoiceNumber: number;
  currency: string;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  date: Date;
  dueDate: number;
  total: number;
  note?: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
  }[];
}

export abstract class BasePdfTemplate {
  protected pdf: jsPDF;
  protected data: InvoiceData;
  protected readonly LINE_HEIGHT = 4;
  protected readonly SECTION_SPACING = 10;

  constructor(data: InvoiceData) {
    this.data = data;
    this.pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    this.pdf.setFont("helvetica");
  }

  // Abstract methods yang harus diimplementasi setiap template
  abstract renderHeader(): void;
  abstract renderFromSection(): void;
  abstract renderClientSection(): void;
  abstract renderInvoiceDetails(): void;
  abstract renderTable(): void;
  abstract renderTotal(): void;
  abstract renderNote(): void;
  abstract renderFooter(): void;

  // Method utama untuk generate PDF
  public generate(): Buffer {
    this.renderHeader();
    this.renderFromSection();
    this.renderClientSection();
    this.renderInvoiceDetails();
    this.renderTable();
    this.renderTotal();
    this.renderNote();
    this.renderFooter();

    return Buffer.from(this.pdf.output("arraybuffer"));
  }

  // Helper methods yang bisa digunakan semua template
  protected formatCurrency(amount: number): string {
    return formatCurrency({
      amount,
      currency: this.data.currency as "USD" | "IDR",
    });
  }

  protected formatDate(date: Date): string {
    return formatIndonesiaDate(date);
  }

  protected wrapText(text: string, maxWidth: number): string[] {
    return this.pdf.splitTextToSize(text, maxWidth);
  }

  protected calculateItemHeight(description: string, maxWidth: number): number {
    const lines = this.wrapText(description, maxWidth);
    const minHeight = 8;
    return Math.max(lines.length * this.LINE_HEIGHT, minHeight);
  }
}
