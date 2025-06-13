/**
 * Utility functions untuk keamanan email dan validasi
 */

// Daftar domain email yang diblokir (disposable email)
const BLOCKED_DOMAINS = [
  "10minutemail.com",
  "tempmail.org",
  "guerrillamail.com",
  "mailinator.com",
  "yopmail.com",
  "temp-mail.org",
  "throwaway.email",
];

// Regex untuk validasi email yang ketat
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validasi format email
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) {
    return false;
  }

  return EMAIL_REGEX.test(email.toLowerCase());
}

/**
 * Cek apakah domain email diblokir
 */
export function isBlockedEmailDomain(email: string): boolean {
  const domain = email.toLowerCase().split("@")[1];
  return BLOCKED_DOMAINS.includes(domain);
}

/**
 * Normalisasi email (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Mask email untuk logging (privacy)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.substring(0, 2)}***@${domain}`;
}

/**
 * Validasi komprehensif email
 */
export function validateEmailForAuth(email: string): {
  isValid: boolean;
  error?: string;
} {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    return {
      isValid: false,
      error: "Format email tidak valid",
    };
  }

  if (isBlockedEmailDomain(normalizedEmail)) {
    return {
      isValid: false,
      error: "Domain email tidak diizinkan",
    };
  }

  return { isValid: true };
}

/**
 * Generate secure verification token
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Cek apakah email verification masih valid (belum expired)
 */
export function isVerificationTokenValid(
  createdAt: Date,
  expiryHours: number = 24
): boolean {
  const now = new Date();
  const expiryTime = new Date(
    createdAt.getTime() + expiryHours * 60 * 60 * 1000
  );
  return now < expiryTime;
}

/**
 * Rate limiting untuk email sending
 */
const emailSendingLog = new Map<string, number[]>();

export function canSendEmail(email: string, maxPerHour: number = 3): boolean {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  const emailHistory = emailSendingLog.get(email) || [];
  const recentSends = emailHistory.filter(
    (timestamp) => timestamp > oneHourAgo
  );

  if (recentSends.length >= maxPerHour) {
    return false;
  }

  // Update log
  recentSends.push(now);
  emailSendingLog.set(email, recentSends);

  return true;
}

/**
 * Cleanup expired email logs (jalankan secara periodik)
 */
export function cleanupEmailLogs(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  for (const [email, timestamps] of emailSendingLog.entries()) {
    const validTimestamps = timestamps.filter(
      (timestamp) => timestamp > oneHourAgo
    );

    if (validTimestamps.length === 0) {
      emailSendingLog.delete(email);
    } else {
      emailSendingLog.set(email, validTimestamps);
    }
  }
}

// Cleanup otomatis setiap 30 menit
if (typeof window === "undefined") {
  // Server-side only
  setInterval(cleanupEmailLogs, 30 * 60 * 1000);
}
