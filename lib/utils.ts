import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatTanggal(date: Date | string, fmt = 'dd MMMM yyyy'): string {
  return format(new Date(date), fmt, { locale: localeId })
}

export function formatTanggalJam(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: localeId })
}

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal)
}

export function generateSlug(judul: string): string {
  return (
    judul
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() +
    '-' +
    Date.now()
  )
}

export function generateNomorSurat(jenis: string): string {
  const now = new Date()
  const tahun = now.getFullYear()
  const bulan = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 9000) + 1000
  return `${random}/${jenis.toUpperCase()}/DESA/${bulan}/${tahun}`
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    DIPROSES: 'bg-blue-100 text-blue-800',
    DISETUJUI: 'bg-green-100 text-green-800',
    DITOLAK: 'bg-red-100 text-red-800',
    SELESAI: 'bg-emerald-100 text-emerald-800',
    DITERIMA: 'bg-yellow-100 text-yellow-800',
    DICEK: 'bg-blue-100 text-blue-800',
    AKTIF: 'bg-green-100 text-green-800',
    TIDAK_AKTIF: 'bg-gray-100 text-gray-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Menunggu',
    DIPROSES: 'Diproses',
    DISETUJUI: 'Disetujui',
    DITOLAK: 'Ditolak',
    SELESAI: 'Selesai',
    DITERIMA: 'Diterima',
    DICEK: 'Sedang Dicek',
    AKTIF: 'Aktif',
    TIDAK_AKTIF: 'Tidak Aktif',
    JALAN_RUSAK: 'Jalan Rusak',
    LAMPU_MATI: 'Lampu Mati',
    SAMPAH: 'Sampah',
    DRAINASE: 'Drainase',
    KEAMANAN: 'Keamanan',
    SOSIAL: 'Sosial',
    LAINNYA: 'Lainnya',
    DOMISILI: 'Surat Domisili',
    KETERANGAN_USAHA: 'Ket. Usaha',
    TIDAK_MAMPU: 'Ket. Tidak Mampu',
    PENGANTAR_KTP: 'Pengantar KTP',
    PENGANTAR_KK: 'Pengantar KK',
    PENGANTAR_SKCK: 'Pengantar SKCK',
    PKH: 'PKH',
    BLT: 'BLT',
    BPNT: 'BPNT',
    KIP: 'KIP',
    WARGA: 'Warga',
    ADMIN_DESA: 'Admin Desa',
    SEKDES: 'Sekretaris Desa',
    KASI_PELAYANAN: 'Kasi Pelayanan',
    KAUR_UMUM: 'Kaur Umum',
    RT_RW: 'RT/RW',
    LAKI_LAKI: 'Laki-laki',
    PEREMPUAN: 'Perempuan',
    BELUM_KAWIN: 'Belum Kawin',
    KAWIN: 'Kawin',
    CERAI_HIDUP: 'Cerai Hidup',
    CERAI_MATI: 'Cerai Mati',
    ISLAM: 'Islam',
    KRISTEN: 'Kristen',
    KATOLIK: 'Katolik',
    HINDU: 'Hindu',
    BUDDHA: 'Buddha',
    KONGHUCU: 'Konghucu',
  }
  return map[status] || status
}

export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Menghitung umur dari tanggal lahir
export function hitungUmur(tanggalLahir: Date | string): number {
  const lahir = new Date(tanggalLahir)
  const sekarang = new Date()
  let umur = sekarang.getFullYear() - lahir.getFullYear()
  const bulan = sekarang.getMonth() - lahir.getMonth()
  if (bulan < 0 || (bulan === 0 && sekarang.getDate() < lahir.getDate())) {
    umur--
  }
  return umur
}