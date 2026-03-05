-- CreateEnum
CREATE TYPE "Role" AS ENUM ('WARGA', 'ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW');

-- CreateEnum
CREATE TYPE "StatusSurat" AS ENUM ('PENDING', 'DIPROSES', 'DISETUJUI', 'DITOLAK', 'SELESAI');

-- CreateEnum
CREATE TYPE "JenisSurat" AS ENUM ('DOMISILI', 'KETERANGAN_USAHA', 'TIDAK_MAMPU', 'PENGANTAR_KTP', 'PENGANTAR_KK', 'PENGANTAR_SKCK', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusPengaduan" AS ENUM ('DITERIMA', 'DICEK', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "KategoriPengaduan" AS ENUM ('JALAN_RUSAK', 'LAMPU_MATI', 'SAMPAH', 'DRAINASE', 'KEAMANAN', 'SOSIAL', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusBansos" AS ENUM ('AKTIF', 'TIDAK_AKTIF', 'PENDING');

-- CreateEnum
CREATE TYPE "JenisBansos" AS ENUM ('PKH', 'BLT', 'BPNT', 'KIP', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusNotifikasi" AS ENUM ('BELUM_DIBACA', 'SUDAH_DIBACA');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "StatusKawin" AS ENUM ('BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI');

-- CreateEnum
CREATE TYPE "Agama" AS ENUM ('ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "noHp" TEXT,
    "role" "Role" NOT NULL DEFAULT 'WARGA',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penduduk" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "noKK" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "agama" "Agama" NOT NULL,
    "statusKawin" "StatusKawin" NOT NULL,
    "pekerjaan" TEXT,
    "pendidikan" TEXT,
    "golonganDarah" TEXT,
    "alamat" TEXT NOT NULL,
    "rt" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "dusun" TEXT,
    "kelurahan" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kabupaten" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kodePos" TEXT,
    "statusHidup" BOOLEAN NOT NULL DEFAULT true,
    "tanggalMeninggal" TIMESTAMP(3),
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penduduk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kartu_keluarga" (
    "id" TEXT NOT NULL,
    "noKK" TEXT NOT NULL,
    "namaKepala" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "rt" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kabupaten" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kartu_keluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat" (
    "id" TEXT NOT NULL,
    "nomorSurat" TEXT,
    "userId" TEXT NOT NULL,
    "jenisSurat" "JenisSurat" NOT NULL,
    "keperluan" TEXT NOT NULL,
    "status" "StatusSurat" NOT NULL DEFAULT 'PENDING',
    "catatanAdmin" TEXT,
    "dokumenUrl" TEXT,
    "suratJadiUrl" TEXT,
    "tanggalDiajukan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalDiproses" TIMESTAMP(3),
    "tanggalSelesai" TIMESTAMP(3),
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengaduan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" "KategoriPengaduan" NOT NULL,
    "lokasi" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "status" "StatusPengaduan" NOT NULL DEFAULT 'DITERIMA',
    "prioritas" INTEGER NOT NULL DEFAULT 3,
    "assignedTo" TEXT,
    "catatanAdmin" TEXT,
    "buktiSelesai" TEXT,
    "rating" INTEGER,
    "feedbackWarga" TEXT,
    "tanggalLapor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalUpdate" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),

    CONSTRAINT "pengaduan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bansos" (
    "id" TEXT NOT NULL,
    "pendudukId" TEXT NOT NULL,
    "jenisBansos" "JenisBansos" NOT NULL,
    "status" "StatusBansos" NOT NULL DEFAULT 'PENDING',
    "tahun" INTEGER NOT NULL,
    "nominal" DOUBLE PRECISION,
    "keterangan" TEXT,
    "tanggalMulai" TIMESTAMP(3),
    "tanggalAkhir" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bansos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penyaluran" (
    "id" TEXT NOT NULL,
    "bansosId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penyaluran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berita" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "excerpt" TEXT,
    "fotoUrl" TEXT,
    "kategori" TEXT NOT NULL,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "refId" TEXT,
    "status" "StatusNotifikasi" NOT NULL DEFAULT 'BELUM_DIBACA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "isFromAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infrastruktur" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kondisi" TEXT NOT NULL,
    "foto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BAIK',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infrastruktur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profil_desa" (
    "id" TEXT NOT NULL,
    "namaDesaa" TEXT NOT NULL,
    "kepalaDesaa" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telepon" TEXT,
    "email" TEXT,
    "website" TEXT,
    "deskripsi" TEXT,
    "visi" TEXT,
    "misi" TEXT,
    "luasWilayah" DOUBLE PRECISION,
    "jumlahDusun" INTEGER,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profil_desa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "penduduk_userId_key" ON "penduduk"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "penduduk_nik_key" ON "penduduk"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "kartu_keluarga_noKK_key" ON "kartu_keluarga"("noKK");

-- CreateIndex
CREATE UNIQUE INDEX "surat_nomorSurat_key" ON "surat"("nomorSurat");

-- CreateIndex
CREATE UNIQUE INDEX "berita_slug_key" ON "berita"("slug");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penduduk" ADD CONSTRAINT "penduduk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penduduk" ADD CONSTRAINT "penduduk_noKK_fkey" FOREIGN KEY ("noKK") REFERENCES "kartu_keluarga"("noKK") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat" ADD CONSTRAINT "surat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengaduan" ADD CONSTRAINT "pengaduan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bansos" ADD CONSTRAINT "bansos_pendudukId_fkey" FOREIGN KEY ("pendudukId") REFERENCES "penduduk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penyaluran" ADD CONSTRAINT "penyaluran_bansosId_fkey" FOREIGN KEY ("bansosId") REFERENCES "bansos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berita" ADD CONSTRAINT "berita_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
