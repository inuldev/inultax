# 📊 InulTax - Platform Invoice Management Terdepan

**InulTax** adalah platform invoice management berbasis web yang dibangun dengan teknologi modern untuk membantu bisnis Indonesia mengelola faktur dengan mudah, cepat, dan profesional.

<div align="center">
  <img src="./public/thumbnail.png" alt="InulTax Thumbnail" width="600" />
</div>

![InulTax Banner](https://img.shields.io/badge/InulTax-Invoice%20Management-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.9.0-2D3748?style=flat-square&logo=prisma)

## ✨ Fitur Utama

- 🧾 **Invoice Management** - Buat, edit, dan kelola invoice dengan mudah
- 📧 **Email Automation** - Notifikasi otomatis dan reminder pembayaran
- 📊 **Dashboard Analytics** - Visualisasi revenue dan statistik bisnis
- 💰 **Multi-Currency** - Support USD dan IDR dengan format otomatis
- 📱 **Responsive Design** - Optimal di desktop dan mobile
- 🔐 **Secure Authentication** - Login aman via email magic link
- 📄 **PDF Export** - Generate PDF invoice otomatis dengan layout dinamis
- 🌐 **Bahasa Indonesia** - Interface lengkap dalam bahasa Indonesia
- ✨ **Dynamic Forms** - Auto-resize textarea dan input yang responsif
- 🎯 **Optimized PDF** - Layout PDF yang menyesuaikan konten untuk efisiensi space

## 🏗️ Teknologi yang Digunakan

### Frontend & Framework

- **Next.js 15.3.3** - React framework dengan App Router
- **React 19** - Library UI terbaru
- **TypeScript 5** - Type safety dan developer experience
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### Backend & Database

- **PostgreSQL** - Database relational yang robust
- **Prisma 6.9.0** - Modern database toolkit dan ORM
- **NextAuth.js 5** - Authentication solution
- **Nodemailer 7** - Email service integration

### Tools & Libraries

- **Zod** - Schema validation
- **Conform** - Form handling dan validation
- **jsPDF** - PDF generation
- **Recharts** - Data visualization charts
- **Lucide React** - Beautiful icon library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Gmail account untuk email service

### Installation

1. **Clone repository**

```bash
git clone <repository-url>
cd inultax
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env.local
```

Isi file `.env.local` dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/inultax"

# NextAuth
AUTH_SECRET="your-secret-key"

# Email Configuration (Gmail)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

4. **Setup database**

```bash
npx prisma migrate dev
npx prisma generate
```

5. **Run development server**

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 📁 Struktur Proyek

```
inultax/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── email/                # Email reminder API
│   │   └── invoice/              # PDF download API
│   ├── components/               # React components
│   │   ├── CreateInvoice.tsx     # Form create invoice dengan auto-resize
│   │   ├── EditInvoice.tsx       # Form edit invoice dengan validasi
│   │   ├── InvoiceList.tsx       # List invoice table
│   │   ├── DashboardBlocks.tsx   # Dashboard statistics
│   │   └── ...
│   ├── dashboard/                # Protected dashboard routes
│   │   ├── invoices/             # Invoice management
│   │   └── page.tsx              # Dashboard home
│   ├── utils/                    # Utility functions
│   │   ├── auth.ts               # NextAuth configuration
│   │   ├── db.ts                 # Prisma client
│   │   ├── nodemailer.ts         # Email functions
│   │   ├── zodSchemas.ts         # Validation schemas
│   │   └── templates/            # Email templates
│   ├── actions.ts                # Server actions dengan string handling
│   └── layout.tsx                # Root layout
├── prisma/                       # Database schema
│   └── schema.prisma
├── components/                   # Reusable UI components
│   └── ui/                       # Shadcn/ui components
├── lib/                          # Library configurations
└── public/                       # Static assets
```

## 🗄️ Database Schema

### Model User

```sql
User {
  id            String    @id @default(cuid())
  firstName     String?
  lastName      String?
  address       String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  invoices      Invoice[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Model Invoice

```sql
Invoice {
  id            String        @id @default(uuid())
  invoiceName   String
  total         Int
  status        InvoiceStatus // PAID | PENDING
  date          DateTime
  dueDate       Int
  fromName      String
  fromEmail     String
  fromAddress   String
  clientName    String
  clientEmail   String
  clientAddress String
  currency      String        // USD | IDR
  invoiceNumber Int
  note          String?
  items         InvoiceItem[] // Multiple items support
  userId        String?
  User          User?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

InvoiceItem {
  id          String  @id @default(uuid())
  description String
  quantity    Int
  rate        Int
  invoice     Invoice @relation(fields: [invoiceId], references: [id])
  invoiceId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔐 Authentication & Security

### Email-based Authentication

- **Magic Link Login** - Login tanpa password via email
- **NextAuth.js 5** - Secure authentication provider
- **Database Sessions** - Session management dengan PostgreSQL

### Security Features

- ✅ **Rate Limiting** - 3 email per jam per alamat
- ✅ **Email Validation** - Sanitization dan format checking
- ✅ **TLS Encryption** - Secure email transmission
- ✅ **Environment Validation** - Required env vars checking
- ✅ **Session Security** - 30 hari max age, 24 jam update cycle

## 📧 Email System

### Email Templates

1. **Invoice Created** - Notifikasi invoice baru untuk klien
2. **Invoice Updated** - Notifikasi perubahan invoice
3. **Payment Reminder** - Reminder pembayaran otomatis

### Email Features

- 📧 **HTML Templates** - Professional email design
- 🖼️ **Logo Attachment** - Branding konsisten
- 🌐 **Indonesian Language** - Localized content
- ⚡ **Auto-send** - Trigger otomatis pada CRUD operations
- 🔄 **Retry Logic** - Error handling dan logging

## 🎯 Fitur Detail

### Invoice Management

- **Create Invoice** - Form lengkap dengan real-time validation dan auto-resize textarea
- **Edit Invoice** - Update dengan email notification dan preservasi data
- **Delete Invoice** - Soft delete dengan konfirmasi
- **PDF Export** - Generate PDF via `/api/invoice/[id]` dengan layout dinamis
- **Status Tracking** - PAID/PENDING dengan visual indicators
- **Dynamic Items** - Tambah/hapus item dengan validasi string-to-number
- **Optimized PDF Layout** - Tinggi item menyesuaikan konten untuk space efficiency

### Dashboard Analytics

- **Revenue Overview** - Total pendapatan per mata uang
- **Invoice Statistics** - Count berdasarkan status
- **Visual Charts** - Grafik interaktif dengan Recharts
- **Recent Activity** - List invoice terbaru

### User Experience

- **Responsive Design** - Mobile-first approach
- **Loading States** - Skeleton dan loading indicators
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time dengan Zod schemas dan string handling
- **Empty States** - Guidance untuk user baru
- **Auto-resize Components** - Textarea yang menyesuaikan konten
- **Optimized Input** - Number input dengan proper string-to-number conversion

## 🔧 Recent Improvements

### Form Optimization

- **Fixed Input Handling** - Resolved "Cannot assign to read only property" error
- **String-based State** - Improved number input handling dengan string state
- **Auto-resize Textarea** - Dynamic height adjustment untuk item descriptions
- **Better Validation** - Enhanced form validation dengan proper type conversion

### PDF Generation Enhancement

- **Dynamic Layout** - PDF height menyesuaikan konten item
- **Optimized Spacing** - Reduced line height dan spacing untuk efficiency
- **Compact Design** - Minimal space wastage dengan smart layout
- **Professional Output** - Maintained quality dengan improved space utilization

### Code Quality

- **Type Safety** - Improved TypeScript interfaces dan type handling
- **Consistent Architecture** - Clean separation of concerns
- **Error Prevention** - Proactive handling of form conflicts
- **Performance** - Optimized rendering dan state management

## 🛣️ API Endpoints

### Public Endpoints

- `GET /api/invoice/[invoiceId]` - Download PDF invoice dengan dynamic layout
- `POST /api/auth/[...nextauth]` - NextAuth authentication

### Protected Endpoints

- `POST /api/email/[invoiceId]` - Send payment reminder email

## 📱 Screenshots & Demo

### Landing Page

- Hero section dengan fitur showcase
- Testimonials dan trust indicators
- Responsive design untuk semua device

### Dashboard

- Analytics cards dengan revenue tracking
- Interactive charts dan graphs
- Recent invoices table

### Invoice Management

- Form create/edit dengan real-time validation
- Invoice list dengan filtering dan sorting
- PDF preview dan download

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables untuk Production

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="production-secret-key"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_USER="your-production-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Database Migration

```bash
# Production migration
npx prisma migrate deploy
npx prisma generate
```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Test Coverage

- ✅ Authentication flow
- ✅ Invoice CRUD operations
- ✅ Email sending functionality
- ✅ Form validation
- ✅ API endpoints

## 📊 Performance

### Core Web Vitals

- **LCP** < 2.5s - Optimized images dan lazy loading
- **FID** < 100ms - Minimal JavaScript bundle
- **CLS** < 0.1 - Stable layout dengan proper sizing

### Optimizations

- **Next.js App Router** - Server-side rendering
- **Turbopack** - Fast development builds
- **Image Optimization** - Next.js Image component
- **Database Indexing** - Optimized Prisma queries

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Prettier untuk code formatting
- Write tests untuk new features
- Update documentation

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://radix-ui.com/) - UI components
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

Jika Anda memiliki pertanyaan atau butuh bantuan:

- 📧 Email: support@inultax.com
- 💬 Discord: [InulTax Community](https://discord.gg/inultax)
- 📖 Documentation: [docs.inultax.com](https://docs.inultax.com)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/inultax/inultax/issues)

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk komunitas bisnis Indonesia</p>
  <p><strong>InulTax</strong> - Platform Invoice Management Terdepan</p>
</div>
