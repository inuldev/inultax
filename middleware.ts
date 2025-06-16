import { NextRequest, NextResponse } from "next/server";

// Rate limiting storage (dalam production, gunakan Redis atau database)
// Menggunakan global object untuk Edge Runtime compatibility
declare global {
  var rateLimitMap:
    | Map<string, { count: number; resetTime: number }>
    | undefined;
}

const rateLimitMap =
  globalThis.rateLimitMap ??
  new Map<string, { count: number; resetTime: number }>();
if (process.env.NODE_ENV !== "production")
  globalThis.rateLimitMap = rateLimitMap;

// Konfigurasi rate limiting
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 menit
const MAX_REQUESTS = 5; // maksimal 5 request per window

function getRateLimitKey(ip: string, email?: string): string {
  return email ? `email:${email}` : `ip:${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (now > record.resetTime) {
    // Reset window
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cleanup expired entries secara periodik
  if (Math.random() < 0.1) {
    // 10% chance untuk cleanup
    cleanupExpiredEntries();
  }

  // Rate limiting untuk auth endpoints
  if (
    pathname.startsWith("/api/auth/signin") ||
    pathname.startsWith("/api/auth/callback")
  ) {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const email = request.nextUrl.searchParams.get("email");

    const rateLimitKey = getRateLimitKey(ip, email || undefined);

    if (isRateLimited(rateLimitKey)) {
      console.warn(`Rate limit exceeded for ${rateLimitKey}`);
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message:
            "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "900", // 15 menit
          },
        }
      );
    }
  }

  // Untuk proteksi halaman dashboard, kita akan menggunakan server-side check
  // di dalam page component karena auth() tidak kompatibel dengan Edge Runtime

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match specific paths untuk rate limiting
     */
    "/api/auth/signin/:path*",
    "/api/auth/callback/:path*",
  ],
};
