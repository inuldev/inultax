"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";

import prisma from "./utils/db";
import { requireUser } from "./utils/hooks";
import { onboardingSchema, invoiceSchema } from "./utils/zodSchemas";
import { formatCurrency } from "./utils/formatCurrency";
import {
  sendCreateInvoiceEmail,
  sendEditInvoiceEmail,
} from "./utils/nodemailer";

export async function onboardUser(_prevState: unknown, formData: FormData) {
  try {
    const session = await requireUser();

    const submission = parseWithZod(formData, {
      schema: onboardingSchema,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    // Pastikan user ID ada
    if (!session.user?.id) {
      return {
        status: "error" as const,
        error: {
          "": ["User ID tidak ditemukan. Silakan login ulang."],
        },
      };
    }

    // Update user data
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName: submission.value.firstName,
        lastName: submission.value.lastName,
        address: submission.value.address,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return {
      status: "error" as const,
      error: {
        "": ["Terjadi kesalahan saat menyimpan data. Silakan coba lagi."],
      },
    };
  }

  // Redirect setelah berhasil
  redirect("/dashboard");
}

export async function createInvoice(_prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.invoice.create({
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      userId: session.user?.id,
    },
  });

  // Kirim email menggunakan nodemailer
  try {
    await sendCreateInvoiceEmail({
      to: submission.value.clientEmail,
      clientName: submission.value.clientName,
      invoiceNumber: submission.value.invoiceNumber.toString(),
      invoiceDueDate: new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
      }).format(new Date(submission.value.date)),
      invoiceAmount: formatCurrency({
        amount: submission.value.total,
        currency: submission.value.currency,
      }),
      invoiceLink:
        process.env.NODE_ENV !== "production"
          ? `http://localhost:3000/api/invoice/${data.id}`
          : `https://inultax.vercel.app/api/invoice/${data.id}`,
    });
  } catch (error) {
    console.error("Failed to send invoice email:", error);
    // Tidak throw error agar invoice tetap tersimpan meski email gagal
  }

  return redirect("/dashboard/invoices");
}

export async function editInvoice(_prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.invoice.update({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id,
    },
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
    },
  });

  // Kirim email menggunakan nodemailer
  try {
    await sendEditInvoiceEmail({
      to: submission.value.clientEmail,
      clientName: submission.value.clientName,
      invoiceNumber: submission.value.invoiceNumber.toString(),
      invoiceDueDate: new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
      }).format(new Date(submission.value.date)),
      invoiceAmount: formatCurrency({
        amount: submission.value.total,
        currency: submission.value.currency,
      }),
      invoiceLink:
        process.env.NODE_ENV !== "production"
          ? `http://localhost:3000/api/invoice/${data.id}`
          : `https://inultax.vercel.app/api/invoice/${data.id}`,
    });
  } catch (error) {
    console.error("Failed to send edit invoice email:", error);
    // Tidak throw error agar invoice tetap tersimpan meski email gagal
  }

  return redirect("/dashboard/invoices");
}

export async function DeleteInvoice(invoiceId: string) {
  const session = await requireUser();

  await prisma.invoice.delete({
    where: {
      userId: session.user?.id,
      id: invoiceId,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function MarkAsPaidAction(invoiceId: string) {
  const session = await requireUser();

  await prisma.invoice.update({
    where: {
      userId: session.user?.id,
      id: invoiceId,
    },
    data: {
      status: "PAID",
    },
  });

  return redirect("/dashboard/invoices");
}
