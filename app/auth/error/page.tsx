import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

const errorMessages = {
  Configuration:
    "Terjadi masalah konfigurasi server. Silakan hubungi administrator.",
  AccessDenied:
    "Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.",
  Verification:
    "Link verifikasi tidak valid atau sudah kedaluwarsa. Silakan minta link baru.",
  Default: "Terjadi kesalahan saat proses autentifikasi. Silakan coba lagi.",
};

export default async function AuthError({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const error = params.error as keyof typeof errorMessages;
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#c9d9e9,transparent)]"></div>
      </div>
      <Card className="w-[380px] px-5">
        <CardHeader className="text-center">
          <div className="mb-4 mx-auto flex size-20 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Autentifikasi Gagal
          </CardTitle>
          <CardDescription className="text-center">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 rounded-md bg-red-50 border-red-300 p-4">
            <div className="flex items-center">
              <AlertTriangle className="size-5 text-red-400" />
              <p className="text-sm font-medium text-red-700 ml-3">
                Jika masalah berlanjut, silakan hubungi support.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link
            href="/login"
            className={buttonVariants({
              className: "flex-1",
              variant: "default",
            })}
          >
            Coba Lagi
          </Link>
          <Link
            href="/"
            className={buttonVariants({
              className: "flex-1",
              variant: "outline",
            })}
          >
            <ArrowLeft className="size-4 mr-2" /> Beranda
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
