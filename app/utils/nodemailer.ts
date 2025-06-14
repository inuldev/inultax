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

// Template HTML untuk invoice baru
const createInvoiceTemplate = (data: {
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Baru - InulTax</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
    <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
      <h1 style="color: #333; margin: 0;">InulTax</h1>
      <p style="color: #666; margin: 5px 0;">Invoice Baru Telah Dibuat</p>
    </div>
    
    <div style="padding: 30px 0;">
      <h2 style="color: #333;">Halo ${data.clientName},</h2>
      <p style="color: #666; line-height: 1.6;">
        Invoice baru telah dibuat untuk Anda dengan detail sebagai berikut:
      </p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Nomor Invoice:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">#${data.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Tanggal Jatuh Tempo:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.invoiceDueDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Total Amount:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 18px;">${data.invoiceAmount}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.invoiceLink}" 
           style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Lihat Invoice
        </a>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        Silakan klik tombol di atas untuk melihat detail lengkap invoice Anda.
      </p>
    </div>
    
    <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #999; font-size: 12px;">
      <p>Email ini dikirim otomatis dari sistem InulTax</p>
      <p>Jika Anda memiliki pertanyaan, silakan hubungi kami.</p>
    </div>
  </div>
</body>
</html>
`;

// Template HTML untuk invoice yang diupdate
const editInvoiceTemplate = (data: {
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Diperbarui - InulTax</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
    <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
      <h1 style="color: #333; margin: 0;">InulTax</h1>
      <p style="color: #666; margin: 5px 0;">Invoice Telah Diperbarui</p>
    </div>
    
    <div style="padding: 30px 0;">
      <h2 style="color: #333;">Halo ${data.clientName},</h2>
      <p style="color: #666; line-height: 1.6;">
        Invoice Anda telah diperbarui dengan detail terbaru sebagai berikut:
      </p>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Nomor Invoice:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">#${data.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Tanggal Jatuh Tempo:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.invoiceDueDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Total Amount:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 18px;">${data.invoiceAmount}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.invoiceLink}" 
           style="background-color: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Lihat Invoice Terbaru
        </a>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        Silakan klik tombol di atas untuk melihat perubahan terbaru pada invoice Anda.
      </p>
    </div>
    
    <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #999; font-size: 12px;">
      <p>Email ini dikirim otomatis dari sistem InulTax</p>
      <p>Jika Anda memiliki pertanyaan, silakan hubungi kami.</p>
    </div>
  </div>
</body>
</html>
`;

// Template HTML untuk reminder invoice
const reminderInvoiceTemplate = (data: {
  clientName: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyZipCode: string;
  companyCountry: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder Invoice - InulTax</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
    <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
      <h1 style="color: #333; margin: 0;">${data.companyName}</h1>
      <p style="color: #666; margin: 5px 0;">Reminder Pembayaran Invoice</p>
    </div>
    
    <div style="padding: 30px 0;">
      <h2 style="color: #333;">Halo ${data.clientName},</h2>
      <p style="color: #666; line-height: 1.6;">
        Ini adalah pengingat untuk pembayaran invoice yang belum diselesaikan.
      </p>
      
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <h3 style="color: #721c24; margin: 0 0 10px 0;">Informasi Perusahaan:</h3>
        <p style="color: #721c24; margin: 5px 0;">${data.companyAddress}</p>
        <p style="color: #721c24; margin: 5px 0;">${data.companyCity}, ${data.companyZipCode}</p>
        <p style="color: #721c24; margin: 5px 0;">${data.companyCountry}</p>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        Mohon segera lakukan pembayaran untuk menghindari keterlambatan.
        Jika Anda sudah melakukan pembayaran, silakan abaikan email ini.
      </p>
    </div>
    
    <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #999; font-size: 12px;">
      <p>Email ini dikirim otomatis dari sistem InulTax</p>
      <p>Jika Anda memiliki pertanyaan, silakan hubungi kami.</p>
    </div>
  </div>
</body>
</html>
`;

// Fungsi untuk mengirim email invoice baru
export async function sendCreateInvoiceEmail(data: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
}) {
  const mailOptions = {
    from: process.env.EMAIL_FROM!,
    to: data.to,
    subject: `Invoice Baru #${data.invoiceNumber} - InulTax`,
    html: createInvoiceTemplate(data),
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
  const mailOptions = {
    from: process.env.EMAIL_FROM!,
    to: data.to,
    subject: `Invoice Diperbarui #${data.invoiceNumber} - InulTax`,
    html: editInvoiceTemplate(data),
  };

  return await transporter.sendMail(mailOptions);
}

// Fungsi untuk mengirim email reminder
export async function sendReminderEmail(data: {
  to: string;
  clientName: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyZipCode: string;
  companyCountry: string;
}) {
  const mailOptions = {
    from: process.env.EMAIL_FROM!,
    to: data.to,
    subject: `Reminder Pembayaran Invoice - ${data.companyName}`,
    html: reminderInvoiceTemplate(data),
  };

  return await transporter.sendMail(mailOptions);
}
