# 📁 STRUKTUR FOLDER LENGKAP — SIDESAA (Next.js App Router)

> Disesuaikan dengan struktur project Anda yang sudah ada.
> Stack: Next.js 14 (App Router) + Prisma + PostgreSQL + Tailwind CSS

---

## 🗂️ STRUKTUR FOLDER LENGKAP

```
SIDESAA/
│
├── .next/                          # (auto-generated, jangan disentuh)
│
├── app/                            # ✅ SUDAH ADA — Next.js App Router
│   ├── favicon.ico                 # ✅ SUDAH ADA
│   ├── globals.css                 # ✅ SUDAH ADA
│   ├── layout.tsx                  # ✅ SUDAH ADA — Root layout
│   ├── page.tsx                    # ✅ SUDAH ADA — Landing page / homepage
│   │
│   ├── (auth)/                     # 🆕 Route group untuk autentikasi
│   │   ├── login/
│   │   │   └── page.tsx            # Halaman login
│   │   ├── register/
│   │   │   └── page.tsx            # Halaman registrasi warga
│   │   └── layout.tsx              # Layout khusus auth (tanpa navbar)
│   │
│   ├── (warga)/                    # 🆕 Route group untuk penduduk/warga
│   │   ├── layout.tsx              # Layout warga (dengan sidebar/navbar warga)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard warga
│   │   ├── surat/
│   │   │   ├── page.tsx            # Daftar pengajuan surat warga
│   │   │   ├── ajukan/
│   │   │   │   └── page.tsx        # Form pengajuan surat baru
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detail/status surat
│   │   ├── pengaduan/
│   │   │   ├── page.tsx            # Daftar pengaduan warga
│   │   │   ├── buat/
│   │   │   │   └── page.tsx        # Form buat pengaduan baru
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detail pengaduan
│   │   ├── bansos/
│   │   │   └── page.tsx            # Cek status bantuan sosial
│   │   ├── profil/
│   │   │   └── page.tsx            # Profil & data keluarga warga
│   │   └── chat/
│   │       └── page.tsx            # Chat helpdesk dengan desa
│   │
│   ├── (admin)/                    # 🆕 Route group untuk perangkat desa
│   │   ├── layout.tsx              # Layout admin desa (sidebar admin)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard admin
│   │   ├── surat/
│   │   │   ├── page.tsx            # Manajemen semua surat masuk
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detail & proses surat
│   │   ├── pengaduan/
│   │   │   ├── page.tsx            # Manajemen semua pengaduan
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detail & update pengaduan
│   │   ├── penduduk/
│   │   │   ├── page.tsx            # Manajemen data penduduk
│   │   │   ├── tambah/
│   │   │   │   └── page.tsx        # Tambah data penduduk
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detail/edit data penduduk
│   │   ├── kartu-keluarga/
│   │   │   ├── page.tsx            # Manajemen KK
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detail KK
│   │   ├── bansos/
│   │   │   ├── page.tsx            # Manajemen bantuan sosial
│   │   │   ├── tambah/
│   │   │   │   └── page.tsx        # Tambah penerima bansos
│   │   │   └── penyaluran/
│   │   │       └── page.tsx        # Pencatatan penyaluran
│   │   ├── berita/
│   │   │   ├── page.tsx            # Manajemen berita & pengumuman
│   │   │   ├── tulis/
│   │   │   │   └── page.tsx        # Tulis/buat berita baru
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Edit berita
│   │   ├── infrastruktur/
│   │   │   ├── page.tsx            # Monitoring infrastruktur
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detail infrastruktur
│   │   ├── chat/
│   │   │   └── page.tsx            # Chat helpdesk (sisi admin)
│   │   └── pengaturan/
│   │       └── page.tsx            # Pengaturan profil desa
│   │
│   ├── berita/                     # 🆕 Portal berita publik (tanpa login)
│   │   ├── page.tsx                # Daftar semua berita
│   │   └── [slug]/
│   │       └── page.tsx            # Detail artikel berita
│   │
│   └── api/                        # 🆕 API Routes (Next.js Route Handlers)
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts        # POST /api/auth/login
│       │   ├── register/
│       │   │   └── route.ts        # POST /api/auth/register
│       │   └── logout/
│       │       └── route.ts        # POST /api/auth/logout
│       ├── surat/
│       │   ├── route.ts            # GET (list) / POST (buat)
│       │   └── [id]/
│       │       └── route.ts        # GET / PATCH / DELETE
│       ├── pengaduan/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── penduduk/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── kartu-keluarga/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── bansos/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── penyaluran/
│       │   └── route.ts
│       ├── berita/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── notifikasi/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── chat/
│       │   └── route.ts
│       ├── infrastruktur/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── profil-desa/
│       │   └── route.ts
│       └── upload/
│           └── route.ts            # POST — upload file/foto
│
├── components/                     # 🆕 Komponen reusable
│   ├── ui/                         # Komponen UI dasar
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Pagination.tsx
│   │   ├── Spinner.tsx
│   │   ├── Alert.tsx
│   │   ├── Avatar.tsx
│   │   └── Toast.tsx
│   │
│   ├── layout/                     # Komponen layout
│   │   ├── Navbar.tsx              # Navbar publik
│   │   ├── SidebarWarga.tsx        # Sidebar untuk warga
│   │   ├── SidebarAdmin.tsx        # Sidebar untuk admin
│   │   ├── HeaderPage.tsx          # Header tiap halaman
│   │   └── Footer.tsx
│   │
│   ├── warga/                      # Komponen khusus fitur warga
│   │   ├── DashboardStats.tsx      # Kartu statistik di dashboard
│   │   ├── FormAjukanSurat.tsx     # Form pengajuan surat
│   │   ├── StatusSuratCard.tsx     # Card status surat
│   │   ├── FormPengaduan.tsx       # Form buat pengaduan
│   │   ├── PengaduanCard.tsx       # Card pengaduan
│   │   ├── BansosCard.tsx          # Info bansos warga
│   │   └── NotifikasiDropdown.tsx  # Dropdown notifikasi
│   │
│   ├── admin/                      # Komponen khusus fitur admin
│   │   ├── DashboardAdminStats.tsx
│   │   ├── SuratTable.tsx          # Tabel surat masuk
│   │   ├── PengaduanTable.tsx
│   │   ├── PendudukTable.tsx
│   │   ├── BansosTable.tsx
│   │   ├── BeritaEditor.tsx        # Rich text editor berita
│   │   └── InfrastrukturTable.tsx
│   │
│   └── berita/                     # Komponen portal berita
│       ├── BeritaCard.tsx
│       ├── BeritaList.tsx
│       └── BeritaDetail.tsx
│
├── lib/                            # 🆕 Utilities & konfigurasi
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # Helper autentikasi (JWT/session)
│   ├── utils.ts                    # Fungsi helper umum
│   ├── validations.ts              # Zod schemas validasi input
│   └── constants.ts                # Konstanta aplikasi
│
├── hooks/                          # 🆕 Custom React hooks
│   ├── useAuth.ts                  # Hook cek auth & user
│   ├── useSurat.ts
│   ├── usePengaduan.ts
│   ├── useNotifikasi.ts
│   └── useChat.ts
│
├── types/                          # 🆕 TypeScript types
│   ├── index.ts                    # Export semua types
│   ├── auth.types.ts
│   ├── surat.types.ts
│   ├── pengaduan.types.ts
│   ├── penduduk.types.ts
│   └── bansos.types.ts
│
├── middleware.ts                   # 🆕 Next.js middleware (proteksi route)
│
├── prisma/                         # 🆕 Prisma ORM
│   ├── schema.prisma               # ✅ Schema (SAMA PERSIS seperti yang diberikan)
│   └── seed.ts                     # Data seed awal
│
├── public/                         # ✅ SUDAH ADA
│   ├── images/
│   │   ├── logo-desa.png
│   │   └── banner-desa.jpg
│   └── icons/
│
├── node_modules/                   # ✅ SUDAH ADA (auto)
├── .gitignore                      # ✅ SUDAH ADA
├── eslint.config.mjs               # ✅ SUDAH ADA
├── next-env.d.ts                   # ✅ SUDAH ADA
├── next.config.ts                  # ✅ SUDAH ADA
├── package-lock.json               # ✅ SUDAH ADA
├── package.json                    # ✅ SUDAH ADA
├── postcss.config.mjs              # ✅ SUDAH ADA
├── README.md                       # ✅ SUDAH ADA
├── tsconfig.json                   # ✅ SUDAH ADA
└── .env                            # 🆕 Tambahkan ini (jangan di-commit!)
```

---

## 📦 DEPENDENCIES YANG PERLU DIINSTALL

Jalankan perintah berikut di terminal project Anda:

```bash
# Prisma ORM
npm install prisma @prisma/client
npx prisma init

# Autentikasi
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Validasi
npm install zod

# Upload file
npm install formidable
npm install -D @types/formidable

# Rich text editor (untuk berita)
npm install @tiptap/react @tiptap/starter-kit

# Notifikasi toast
npm install react-hot-toast

# HTTP client (opsional)
npm install axios

# Date utilities
npm install date-fns
```

---

## ⚙️ FILE .env (BUAT DI ROOT PROJECT)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sidesaa_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Upload (opsional - jika pakai Cloudinary)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

---

## 🚀 LANGKAH SETUP AWAL

```bash
# 1. Install semua dependencies
npm install

# 2. Buat file .env dan isi DATABASE_URL

# 3. Inisialisasi Prisma (jika belum)
npx prisma init

# 4. Salin schema.prisma ke folder prisma/

# 5. Buat database & jalankan migrasi
npx prisma migrate dev --name init

# 6. Generate Prisma Client
npx prisma generate

# 7. (Opsional) Jalankan seed data awal
npx prisma db seed

# 8. Jalankan development server
npm run dev
```

---

## 🔐 MIDDLEWARE.TS — Proteksi Route

File `middleware.ts` di root melindungi halaman warga & admin:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Proteksi route warga
  if (pathname.startsWith('/(warga)') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Proteksi route admin
  if (pathname.startsWith('/(admin)') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/surat/:path*', '/pengaduan/:path*', '/admin/:path*']
}
```

---

## 📝 CATATAN PENTING

| File | Status | Keterangan |
|------|--------|-----------|
| `app/layout.tsx` | ✅ Sudah ada | Tambahkan provider (Toast, Auth) |
| `app/page.tsx` | ✅ Sudah ada | Ubah menjadi landing page desa |
| `app/globals.css` | ✅ Sudah ada | Tambahkan CSS variables tema desa |
| `prisma/schema.prisma` | 🆕 Buat baru | Isi dengan schema yang diberikan |
| `middleware.ts` | 🆕 Buat baru | Di root (sejajar dengan app/) |
| `.env` | 🆕 Buat baru | Di root, tambahkan ke .gitignore |
| `lib/prisma.ts` | 🆕 Buat baru | Singleton Prisma client |

---

*Generated for SIDESAA — Sistem Informasi Desa*