import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  nik: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK hanya boleh angka'),
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  noHp: z.string().optional(),
})

export const ajukanSuratSchema = z.object({
  jenisSurat: z.enum([
    'DOMISILI',
    'KETERANGAN_USAHA',
    'TIDAK_MAMPU',
    'PENGANTAR_KTP',
    'PENGANTAR_KK',
    'PENGANTAR_SKCK',
    'LAINNYA',
  ]),
  keperluan: z.string().min(5, 'Keperluan minimal 5 karakter'),
})

export const pengaduanSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  kategori: z.enum([
    'JALAN_RUSAK',
    'LAMPU_MATI',
    'SAMPAH',
    'DRAINASE',
    'KEAMANAN',
    'SOSIAL',
    'LAINNYA',
  ]),
  lokasi: z.string().min(5, 'Lokasi minimal 5 karakter'),
})

export const beritaSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter'),
  konten: z.string().min(20, 'Konten minimal 20 karakter'),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isPinned: z.boolean().optional(),
})

export const pendudukSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  noKK: z.string().min(1, 'No KK wajib diisi'),
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  tempatLahir: z.string().min(2, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
  agama: z.enum(['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU']),
  statusKawin: z.enum(['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI']),
  pekerjaan: z.string().optional(),
  pendidikan: z.string().optional(),
  golonganDarah: z.string().optional(),
  alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
  rt: z.string().min(1, 'RT wajib diisi'),
  rw: z.string().min(1, 'RW wajib diisi'),
  dusun: z.string().optional(),
  kelurahan: z.string().min(1, 'Kelurahan wajib diisi'),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi'),
  kabupaten: z.string().min(1, 'Kabupaten wajib diisi'),
  provinsi: z.string().min(1, 'Provinsi wajib diisi'),
  kodePos: z.string().optional(),
})

export const kartuKeluargaSchema = z.object({
  noKK: z.string().length(16, 'Nomor KK harus 16 digit'),
  namaKepala: z.string().min(1, 'Nama kepala keluarga wajib diisi'),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  rt: z.string().min(1, 'RT wajib diisi'),
  rw: z.string().min(1, 'RW wajib diisi'),
  kelurahan: z.string().min(1, 'Kelurahan wajib diisi'),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi'),
  kabupaten: z.string().min(1, 'Kabupaten wajib diisi'),
  provinsi: z.string().min(1, 'Provinsi wajib diisi'),
})

export const updateSuratSchema = z.object({
  status: z
    .enum(['PENDING', 'DIPROSES', 'DISETUJUI', 'DITOLAK', 'SELESAI'])
    .optional(),
  catatanAdmin: z.string().optional(),
  nomorSurat: z.string().optional(),
  suratJadiUrl: z.string().optional(),
})

export const updatePengaduanSchema = z.object({
  status: z
    .enum(['DITERIMA', 'DICEK', 'DIPROSES', 'SELESAI', 'DITOLAK'])
    .optional(),
  prioritas: z.number().min(1).max(5).optional(),
  catatanAdmin: z.string().optional(),
  assignedTo: z.string().optional(),
  buktiSelesai: z.string().optional(),
})

export const profilDesaSchema = z.object({
  namaDesaa: z.string().min(1, 'Nama desa wajib diisi'),
  kepalaDesaa: z.string().min(1, 'Nama kepala desa wajib diisi'),
  alamat: z.string().min(5),
  telepon: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  deskripsi: z.string().optional(),
  visi: z.string().optional(),
  misi: z.string().optional(),
  luasWilayah: z.number().optional(),
  jumlahDusun: z.number().optional(),
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AjukanSuratInput = z.infer<typeof ajukanSuratSchema>
export type PengaduanInput = z.infer<typeof pengaduanSchema>
export type BeritaInput = z.infer<typeof beritaSchema>
export type PendudukInput = z.infer<typeof pendudukSchema>
export type KartuKeluargaInput = z.infer<typeof kartuKeluargaSchema>
export type UpdateSuratInput = z.infer<typeof updateSuratSchema>
export type UpdatePengaduanInput = z.infer<typeof updatePengaduanSchema>
export type ProfilDesaInput = z.infer<typeof profilDesaSchema>