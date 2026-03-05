import type { Role } from '@/lib/auth'

// Re-export Role dari auth
export type { Role }

// ========================
// Enum Types (manual — Prisma v6)
// ========================
export type StatusSurat = 'PENDING' | 'DIPROSES' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI'
export type JenisSurat =
  | 'DOMISILI'
  | 'KETERANGAN_USAHA'
  | 'TIDAK_MAMPU'
  | 'PENGANTAR_KTP'
  | 'PENGANTAR_KK'
  | 'PENGANTAR_SKCK'
  | 'LAINNYA'
export type StatusPengaduan = 'DITERIMA' | 'DICEK' | 'DIPROSES' | 'SELESAI' | 'DITOLAK'
export type KategoriPengaduan =
  | 'JALAN_RUSAK'
  | 'LAMPU_MATI'
  | 'SAMPAH'
  | 'DRAINASE'
  | 'KEAMANAN'
  | 'SOSIAL'
  | 'LAINNYA'
export type StatusBansos = 'AKTIF' | 'TIDAK_AKTIF' | 'PENDING'
export type JenisBansos = 'PKH' | 'BLT' | 'BPNT' | 'KIP' | 'LAINNYA'
export type StatusNotifikasi = 'BELUM_DIBACA' | 'SUDAH_DIBACA'
export type JenisKelamin = 'LAKI_LAKI' | 'PEREMPUAN'
export type StatusKawin = 'BELUM_KAWIN' | 'KAWIN' | 'CERAI_HIDUP' | 'CERAI_MATI'
export type Agama = 'ISLAM' | 'KRISTEN' | 'KATOLIK' | 'HINDU' | 'BUDDHA' | 'KONGHUCU'

// ========================
// Model Types
// ========================
export interface User {
  id: string
  nik: string
  nama: string
  email: string
  password: string
  noHp: string | null
  role: Role
  isVerified: boolean
  isActive: boolean
  fotoUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Penduduk {
  id: string
  userId: string
  nik: string
  noKK: string
  nama: string
  tempatLahir: string
  tanggalLahir: Date
  jenisKelamin: JenisKelamin
  agama: Agama
  statusKawin: StatusKawin
  pekerjaan: string | null
  pendidikan: string | null
  golonganDarah: string | null
  alamat: string
  rt: string
  rw: string
  dusun: string | null
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  kodePos: string | null
  statusHidup: boolean
  tanggalMeninggal: Date | null
  keterangan: string | null
  createdAt: Date
  updatedAt: Date
}

export interface KartuKeluarga {
  id: string
  noKK: string
  namaKepala: string
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  createdAt: Date
  updatedAt: Date
}

export interface Surat {
  id: string
  nomorSurat: string | null
  userId: string
  jenisSurat: JenisSurat
  keperluan: string
  status: StatusSurat
  catatanAdmin: string | null
  dokumenUrl: string | null
  suratJadiUrl: string | null
  tanggalDiajukan: Date
  tanggalDiproses: Date | null
  tanggalSelesai: Date | null
  processedBy: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Pengaduan {
  id: string
  userId: string
  judul: string
  deskripsi: string
  kategori: KategoriPengaduan
  lokasi: string
  fotoUrl: string | null
  status: StatusPengaduan
  prioritas: number
  assignedTo: string | null
  catatanAdmin: string | null
  buktiSelesai: string | null
  rating: number | null
  feedbackWarga: string | null
  tanggalLapor: Date
  tanggalUpdate: Date
  tanggalSelesai: Date | null
}

export interface Bansos {
  id: string
  pendudukId: string
  jenisBansos: JenisBansos
  status: StatusBansos
  tahun: number
  nominal: number | null
  keterangan: string | null
  tanggalMulai: Date | null
  tanggalAkhir: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Penyaluran {
  id: string
  bansosId: string
  tanggal: Date
  nominal: number
  keterangan: string | null
  createdAt: Date
}

export interface Berita {
  id: string
  judul: string
  slug: string
  konten: string
  excerpt: string | null
  fotoUrl: string | null
  kategori: string
  tags: string[]
  isPublished: boolean
  isPinned: boolean
  authorId: string
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Notifikasi {
  id: string
  userId: string
  judul: string
  pesan: string
  tipe: string
  refId: string | null
  status: StatusNotifikasi
  createdAt: Date
}

export interface ChatMessage {
  id: string
  userId: string
  pesan: string
  isFromAdmin: boolean
  isRead: boolean
  createdAt: Date
}

export interface Infrastruktur {
  id: string
  nama: string
  kategori: string
  lokasi: string
  deskripsi: string | null
  kondisi: string
  foto: string | null
  status: string
  catatan: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProfilDesa {
  id: string
  namaDesaa: string
  kepalaDesaa: string
  alamat: string
  telepon: string | null
  email: string | null
  website: string | null
  deskripsi: string | null
  visi: string | null
  misi: string | null
  luasWilayah: number | null
  jumlahDusun: number | null
  logoUrl: string | null
  bannerUrl: string | null
  updatedAt: Date
}

// ========================
// API Response Types
// ========================
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ========================
// Auth Types
// ========================
export interface AuthUser {
  userId: string
  email: string
  role: Role
  nama: string
}

// ========================
// Extended Types (dengan relasi)
// ========================
export interface SuratWithUser extends Surat {
  user: Pick<User, 'id' | 'nama' | 'nik' | 'noHp' | 'email'>
}

export interface PengaduanWithUser extends Pengaduan {
  user: Pick<User, 'id' | 'nama' | 'nik' | 'noHp'>
}

export interface BansosWithDetail extends Bansos {
  penduduk: Pick<Penduduk, 'id' | 'nama' | 'nik'>
  penyaluran: Penyaluran[]
}

export interface BeritaWithAuthor extends Berita {
  author: Pick<User, 'id' | 'nama'>
}

export interface PendudukWithKK extends Penduduk {
  kartuKeluarga: (KartuKeluarga & { anggota: Penduduk[] }) | null
}

export interface ChatMessageWithUser extends ChatMessage {
  user: Pick<User, 'id' | 'nama'>
}

// ========================
// Dashboard Stats
// ========================
export interface DashboardStats {
  totalPenduduk: number
  totalSurat: number
  totalPengaduan: number
  suratPending: number
  pengaduanAktif: number
  totalBerita: number
}