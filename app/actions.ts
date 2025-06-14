"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";

import prisma from "./utils/db";
import { requireUser } from "./utils/hooks";
import { onboardingSchema } from "./utils/zodSchemas";

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
