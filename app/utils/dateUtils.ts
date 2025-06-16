/**
 * Utility functions untuk menangani tanggal dan timezone Indonesia
 */

// Timezone Indonesia
export const INDONESIA_TIMEZONE = "Asia/Jakarta"; // WIB (UTC+7)

/**
 * Mengkonversi Date object ke format ISO string dalam timezone Indonesia
 * @param date - Date object yang akan dikonversi
 * @returns ISO string dalam timezone Indonesia
 */
export function toIndonesiaISOString(date: Date): string {
  // Ambil offset timezone Indonesia (WIB = UTC+7)
  const indonesiaOffset = 7 * 60; // 7 jam dalam menit
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const indonesiaTime = new Date(utcTime + indonesiaOffset * 60000);

  return indonesiaTime.toISOString();
}

/**
 * Mengkonversi string tanggal ke Date object dengan timezone Indonesia
 * @param dateString - String tanggal (ISO format atau format lain)
 * @returns Date object yang sudah disesuaikan dengan timezone Indonesia
 */
export function fromIndonesiaDateString(dateString: string): Date {
  const date = new Date(dateString);

  // Jika date sudah dalam format yang benar, return langsung
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Fallback jika parsing gagal
  return new Date();
}

/**
 * Format tanggal untuk tampilan dalam bahasa Indonesia
 * @param date - Date object atau string tanggal
 * @returns String tanggal dalam format Indonesia
 */
export function formatIndonesiaDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: INDONESIA_TIMEZONE,
  }).format(dateObj);
}

/**
 * Format tanggal untuk tampilan medium dalam bahasa Indonesia
 * @param date - Date object atau string tanggal
 * @returns String tanggal dalam format medium Indonesia
 */
export function formatIndonesiaDateMedium(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: INDONESIA_TIMEZONE,
  }).format(dateObj);
}

/**
 * Mendapatkan tanggal hari ini dalam timezone Indonesia
 * @returns Date object untuk hari ini dalam timezone Indonesia
 */
export function getTodayInIndonesia(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: INDONESIA_TIMEZONE })
  );
}
