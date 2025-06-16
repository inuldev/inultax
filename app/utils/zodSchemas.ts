import { z } from "zod";

export const onboardingSchema = z.object({
  firstName: z.string().min(2, "Nama depan minimal 2 karakter"),
  lastName: z.string().min(2, "Nama belakang minimal 2 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
});

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Deskripsi wajib diisi"),
  quantity: z.number().min(1, "Kuantitas minimal 1"),
  rate: z.number().min(1, "Biaya/Harga minimal 1"),
});

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Nama faktur wajib diisi"),
  total: z.number().min(1, "Minimal Rp 1"),
  status: z.enum(["PAID", "PENDING"]).default("PENDING"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  dueDate: z.number().min(0, "Jatuh tempo wajib diisi"),
  fromName: z.string().min(1, "Nama Anda wajib diisi"),
  fromEmail: z.string().email("Alamat email tidak valid"),
  fromAddress: z.string().min(1, "Alamat Anda wajib diisi"),
  clientName: z.string().min(1, "Nama klien wajib diisi"),
  clientEmail: z.string().email("Alamat email tidak valid"),
  clientAddress: z.string().min(1, "Alamat klien wajib diisi"),
  currency: z.enum(["USD", "IDR"], {
    errorMap: () => ({ message: "Mata uang harus USD atau IDR" }),
  }),
  invoiceNumber: z.number().min(1, "Nomor faktur minimal 1"),
  note: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "Minimal harus ada 1 item"),
});
