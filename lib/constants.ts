export const APP_NAME = 'SIDESAA'
export const APP_DESCRIPTION = 'Sistem Informasi Desa Digital'

export const COOKIE_NAME = 'sidesaa_token'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 hari

export const JENIS_SURAT_OPTIONS = [
  { value: 'DOMISILI', label: 'Surat Keterangan Domisili' },
  { value: 'KETERANGAN_USAHA', label: 'Surat Keterangan Usaha' },
  { value: 'TIDAK_MAMPU', label: 'Surat Keterangan Tidak Mampu' },
  { value: 'PENGANTAR_KTP', label: 'Surat Pengantar KTP' },
  { value: 'PENGANTAR_KK', label: 'Surat Pengantar KK' },
  { value: 'PENGANTAR_SKCK', label: 'Surat Pengantar SKCK' },
  { value: 'LAINNYA', label: 'Surat Lainnya' },
]

export const KATEGORI_PENGADUAN_OPTIONS = [
  { value: 'JALAN_RUSAK', label: 'Jalan Rusak' },
  { value: 'LAMPU_MATI', label: 'Lampu Mati' },
  { value: 'SAMPAH', label: 'Masalah Sampah' },
  { value: 'DRAINASE', label: 'Drainase / Selokan' },
  { value: 'KEAMANAN', label: 'Keamanan' },
  { value: 'SOSIAL', label: 'Masalah Sosial' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

export const JENIS_BANSOS_OPTIONS = [
  { value: 'PKH', label: 'Program Keluarga Harapan (PKH)' },
  { value: 'BLT', label: 'Bantuan Langsung Tunai (BLT)' },
  { value: 'BPNT', label: 'Bantuan Pangan Non Tunai (BPNT)' },
  { value: 'KIP', label: 'Kartu Indonesia Pintar (KIP)' },
  { value: 'LAINNYA', label: 'Bansos Lainnya' },
]

export const AGAMA_OPTIONS = [
  { value: 'ISLAM', label: 'Islam' },
  { value: 'KRISTEN', label: 'Kristen' },
  { value: 'KATOLIK', label: 'Katolik' },
  { value: 'HINDU', label: 'Hindu' },
  { value: 'BUDDHA', label: 'Buddha' },
  { value: 'KONGHUCU', label: 'Konghucu' },
]

export const STATUS_KAWIN_OPTIONS = [
  { value: 'BELUM_KAWIN', label: 'Belum Kawin' },
  { value: 'KAWIN', label: 'Kawin' },
  { value: 'CERAI_HIDUP', label: 'Cerai Hidup' },
  { value: 'CERAI_MATI', label: 'Cerai Mati' },
]

export const JENIS_KELAMIN_OPTIONS = [
  { value: 'LAKI_LAKI', label: 'Laki-laki' },
  { value: 'PEREMPUAN', label: 'Perempuan' },
]

export const GOLONGAN_DARAH_OPTIONS = [
  'A', 'B', 'AB', 'O',
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
]

export const KATEGORI_BERITA_OPTIONS = [
  'Pengumuman',
  'Pembangunan',
  'Sosial',
  'Pertanian',
  'Kesehatan',
  'Pendidikan',
  'Kegiatan',
  'Musyawarah',
  'Bantuan',
  'Infrastruktur',
]

export const PRIORITAS_OPTIONS = [
  { value: 1, label: 'Sangat Tinggi', color: 'text-red-600' },
  { value: 2, label: 'Tinggi', color: 'text-orange-600' },
  { value: 3, label: 'Sedang', color: 'text-yellow-600' },
  { value: 4, label: 'Rendah', color: 'text-green-600' },
  { value: 5, label: 'Sangat Rendah', color: 'text-gray-600' },
]

export const KONDISI_INFRASTRUKTUR_OPTIONS = [
  { value: 'BAIK', label: 'Baik' },
  { value: 'SEDANG', label: 'Sedang' },
  { value: 'RUSAK_RINGAN', label: 'Rusak Ringan' },
  { value: 'RUSAK_BERAT', label: 'Rusak Berat' },
]