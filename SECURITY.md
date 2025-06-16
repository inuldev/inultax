# Panduan Keamanan Autentifikasi Email

## Fitur Keamanan yang Diimplementasikan

### 1. **Validasi Environment Variables**

- Semua environment variables wajib divalidasi saat startup
- Aplikasi akan error jika ada variable yang hilang
- Mencegah deployment dengan konfigurasi tidak lengkap

### 2. **Konfigurasi TLS yang Aman**

- `rejectUnauthorized: true` untuk production
- Cipher yang aman: `SSLv3`
- Timeout yang sesuai untuk mencegah hanging connections
- Connection pooling untuk performa optimal

### 3. **Rate Limiting**

- **Email Verification**: Maksimal 3 email per jam per alamat email
- **Auth Endpoints**: Maksimal 5 request per 15 menit per IP/email
- Automatic cleanup untuk expired entries

### 4. **Validasi Email**

- Format email yang ketat menggunakan regex
- Blokir domain email disposable/temporary
- Normalisasi email (lowercase, trim)
- Validasi panjang maksimal 254 karakter

### 5. **Privacy & Logging**

- Email addresses di-mask dalam logs (`ab***@domain.com`)
- Tidak ada data sensitif dalam console logs
- Error handling yang tidak mengekspos informasi internal

### 6. **Session Security**

- Database-based sessions (lebih aman dari JWT)
- Session expiry: 30 hari
- Auto-refresh setiap 24 jam
- Secure session configuration

### 7. **Email Template Security**

- HTML email template yang aman
- Escape semua user input
- Clear security warnings dalam email
- Link expiry dalam 24 jam

## Konfigurasi Production

### Environment Variables Wajib

```env
AUTH_SECRET="your-secure-random-string"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
DATABASE_URL="your-database-url"
NODE_ENV="production"
```

### Gmail Setup

1. Enable 2FA di akun Gmail
2. Generate App Password (bukan password biasa)
3. Gunakan App Password di `EMAIL_SERVER_PASSWORD`
4. Pastikan `EMAIL_FROM` sama dengan `EMAIL_SERVER_USER`

### Database Security

- Gunakan SSL connection (`sslmode=require`)
- Database credentials yang kuat
- Regular backup dan monitoring

## Monitoring & Alerts

### Log Events yang Dipantau

- Failed email sending attempts
- Rate limit violations
- Invalid email attempts
- Authentication failures
- Suspicious login patterns

### Recommended Monitoring

- Set up alerts untuk rate limit violations
- Monitor email delivery rates
- Track authentication success/failure rates
- Database connection monitoring

## Best Practices

### Development

- Gunakan `.env.local` untuk development
- Jangan commit file `.env` ke repository
- Test email functionality dengan email testing services

### Production

- Gunakan environment variables dari hosting provider
- Enable monitoring dan logging
- Regular security updates
- Backup strategy untuk database

### Email Deliverability

- Setup SPF, DKIM, DMARC records
- Monitor email reputation
- Use dedicated IP jika volume tinggi
- Regular cleanup bounced emails

## Troubleshooting

### Common Issues

1. **Gmail SMTP Error**: Pastikan menggunakan App Password
2. **Rate Limit**: Tunggu cooldown period atau reset cache
3. **Email Not Delivered**: Cek spam folder, email reputation
4. **TLS Error**: Pastikan port dan secure setting benar

### Debug Mode

```env
NODE_ENV=development
```

Akan disable `rejectUnauthorized` untuk debugging TLS issues.

## Security Checklist

- [ ] Environment variables validated
- [ ] TLS properly configured
- [ ] Rate limiting implemented
- [ ] Email validation active
- [ ] Logging privacy-compliant
- [ ] Session security configured
- [ ] Error handling secure
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Regular security updates scheduled

## Contact

Untuk pertanyaan keamanan atau melaporkan vulnerability, hubungi tim development.
