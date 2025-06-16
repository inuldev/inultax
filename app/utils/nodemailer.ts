import * as fs from "fs";
import * as path from "path";
import * as nodemailer from "nodemailer";

// Konfigurasi nodemailer untuk invoice emails (konsisten dengan auth.ts)
const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST!,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "465"),
  secure: true, // Selalu gunakan SSL/TLS untuk port 465
  auth: {
    user: process.env.EMAIL_SERVER_USER!,
    pass: process.env.EMAIL_SERVER_PASSWORD!,
  },
  tls: {
    // Hanya disable untuk development lokal
    rejectUnauthorized: process.env.NODE_ENV === "production",
    // Gunakan cipher yang aman
    ciphers: "SSLv3",
    // Timeout untuk koneksi
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  },
  // Pool connections untuk performa yang lebih baik
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  // Rate limiting
  rateLimit: 10, // max 10 emails per second
};

// Buat transporter
const transporter = nodemailer.createTransport(emailConfig);

// Fungsi untuk membaca dan memproses template HTML
function loadTemplate(
  templateName: string,
  data: Record<string, string>
): string {
  const templatePath = path.join(
    process.cwd(),
    "app",
    "utils",
    "templates",
    templateName
  );
  let template = fs.readFileSync(templatePath, "utf-8");

  // Replace placeholder dengan data
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, data[key]);
  });

  return template;
}

// Fungsi helper untuk attachment logo
function getLogoAttachment() {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  return {
    filename: "logo.png",
    path: logoPath,
    cid: "logo", // Content-ID untuk referensi di HTML
  };
}

// Fungsi untuk mengirim email invoice baru
export async function sendCreateInvoiceEmail(data: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
}) {
  const html = loadTemplate("invoice-created-email-template.html", {
    clientName: data.clientName,
    invoiceNumber: data.invoiceNumber,
    invoiceDueDate: data.invoiceDueDate,
    invoiceAmount: data.invoiceAmount,
    invoiceLink: data.invoiceLink,
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM!,
    to: data.to,
    subject: `Invoice Baru #${data.invoiceNumber} - InulTax`,
    html,
    attachments: [getLogoAttachment()],
  };

  return await transporter.sendMail(mailOptions);
}

// Fungsi untuk mengirim email invoice yang diupdate
export async function sendEditInvoiceEmail(data: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
}) {
  const html = loadTemplate("invoice-updated-email-template.html", {
    clientName: data.clientName,
    invoiceNumber: data.invoiceNumber,
    invoiceDueDate: data.invoiceDueDate,
    invoiceAmount: data.invoiceAmount,
    invoiceLink: data.invoiceLink,
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM!,
    to: data.to,
    subject: `Invoice Diperbarui #${data.invoiceNumber} - InulTax`,
    html,
    attachments: [getLogoAttachment()],
  };

  return await transporter.sendMail(mailOptions);
}

// Fungsi untuk mengirim email reminder
export async function sendReminderEmail(data: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
  daysOverdue: number;
  companyName: string;
  companyEmail: string;
  companyPhone?: string;
}) {
  const html = loadTemplate("invoice-reminder-email-template.html", {
    clientName: data.clientName,
    invoiceNumber: data.invoiceNumber,
    invoiceDueDate: data.invoiceDueDate,
    invoiceAmount: data.invoiceAmount,
    invoiceLink: data.invoiceLink,
    daysOverdue: data.daysOverdue.toString(),
    overdueStatus: data.daysOverdue > 0 ? "TERLAMBAT" : "JATUH TEMPO HARI INI",
    overdueMessage:
      data.daysOverdue > 0
        ? `Invoice ini sudah terlambat ${data.daysOverdue} hari dari tanggal jatuh tempo.`
        : "Invoice ini jatuh tempo hari ini. Mohon segera lakukan pembayaran.",
    companyName: data.companyName,
    companyEmail: data.companyEmail,
    companyPhone: data.companyPhone || "Tidak tersedia",
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM!,
    to: data.to,
    subject: `${
      data.daysOverdue > 0 ? "URGENT" : ""
    } Reminder Pembayaran Invoice #${data.invoiceNumber} - ${data.companyName}`,
    html,
    attachments: [getLogoAttachment()],
  };

  return await transporter.sendMail(mailOptions);
}
