import Link from "next/link";
import { auth } from "./utils/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Selamat Datang di InulTax
          </h1>
          <p className="text-gray-600 mb-8">
            Sistem autentifikasi email yang aman dan terpercaya
          </p>

          {session?.user ? (
            <div className="space-y-4">
              <p className="text-green-600">
                Anda sudah login sebagai: {session.user.email}
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ke Dashboard
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
