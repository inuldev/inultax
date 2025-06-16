import NextAuth from "next-auth";
import nodemailer from "nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";

import prisma from "./db";
import {
  validateEmailForAuth,
  maskEmail,
  canSendEmail,
} from "./email-security";

// Validasi environment variables yang diperlukan
const requiredEnvVars = [
  "EMAIL_SERVER_HOST",
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "EMAIL_FROM",
  "AUTH_SECRET",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Konfigurasi email yang aman
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      server: emailConfig,
      from: process.env.EMAIL_FROM!,
      // Custom email template options
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        try {
          // Validasi email
          const emailValidation = validateEmailForAuth(identifier);
          if (!emailValidation.isValid) {
            console.warn(
              `Invalid email attempt: ${maskEmail(identifier)} - ${
                emailValidation.error
              }`
            );
            throw new Error(emailValidation.error || "Email tidak valid");
          }

          // Rate limiting
          if (!canSendEmail(identifier)) {
            console.warn(
              `Rate limit exceeded for email: ${maskEmail(identifier)}`
            );
            throw new Error(
              "Terlalu banyak permintaan email. Silakan coba lagi dalam 1 jam."
            );
          }

          const { host } = new URL(url);

          // Buat transport nodemailer yang benar
          const transport = nodemailer.createTransport(provider.server);

          await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `Verifikasi Email - ${host}`,
            text: `Verifikasi Email Anda\n\nKlik link berikut untuk masuk:\n${url}\n\nLink ini akan kedaluwarsa dalam 24 jam.\nJika Anda tidak meminta email ini, abaikan saja.`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verifikasi Email</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
                  <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
                    <h1 style="color: #333; margin: 0; font-size: 24px;">Verifikasi Email Anda</h1>
                  </div>

                  <div style="padding: 30px 0;">
                    <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                      Halo,
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                      Klik tombol di bawah untuk masuk ke akun Anda di <strong>${host}</strong>:
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${url}" style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                        Masuk ke Akun
                      </a>
                    </div>

                    <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                      <strong>Catatan Keamanan:</strong>
                    </p>
                    <ul style="color: #666; font-size: 14px; line-height: 1.5;">
                      <li>Link ini akan kedaluwarsa dalam 24 jam</li>
                      <li>Jika Anda tidak meminta email ini, abaikan saja</li>
                      <li>Jangan bagikan link ini kepada siapa pun</li>
                    </ul>
                  </div>

                  <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      Email ini dikirim secara otomatis, mohon jangan membalas.
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });

          // Log sukses (tanpa data sensitif)
          console.log(`Email verification sent to ${maskEmail(identifier)}`);
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error(
            "Gagal mengirim email verifikasi. Silakan coba lagi."
          );
        }
      },
    }),
  ],
  pages: {
    verifyRequest: "/verify",
    error: "/auth/error",
  },
  // Konfigurasi session yang aman
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
    updateAge: 24 * 60 * 60, // Update setiap 24 jam
  },
  // Callbacks untuk logging dan keamanan
  callbacks: {
    async signIn({ user }) {
      // Log attempt (tanpa data sensitif)
      console.log(
        `Sign in attempt for: ${user.email ? maskEmail(user.email) : "unknown"}`
      );
      return true;
    },
    async session({ session, user }) {
      // Tambahkan user ID ke session jika diperlukan
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Jika user login berhasil, cek apakah sudah onboarding
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default redirect ke dashboard, nanti akan dicek di dashboard layout
      return `${baseUrl}/dashboard`;
    },
  },
  // Event handlers untuk monitoring
  events: {
    async signIn({ user }) {
      console.log(
        `User signed in: ${user.email ? maskEmail(user.email) : "unknown"}`
      );
    },
    async signOut() {
      console.log("User signed out");
    },
  },
});
