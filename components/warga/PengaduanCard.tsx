import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

type StatusPengaduan = 'DITERIMA' | 'DICEK' | 'DIPROSES' | 'SELESAI' | 'DITOLAK'

interface PengaduanCardProps {
  id: string
  judul: string
  deskripsi: string
  kategori: string
  lokasi: string
  status: StatusPengaduan
  tanggalLapor: string | Date
  catatanAdmin?: string | null
}

const statusConfig: Record<StatusPengaduan, { label: string; variant: 'blue' | 'yellow' | 'orange' | 'green' | 'red' }> = {
  DITERIMA: { label: 'Diterima',  variant: 'blue' },
  DICEK:    { label: 'Dicek',     variant: 'yellow' },
  DIPROSES: { label: 'Diproses',  variant: 'orange' },
  SELESAI:  { label: 'Selesai',   variant: 'green' },
  DITOLAK:  { label: 'Ditolak',   variant: 'red' },
}

const kategoriEmoji: Record<string, string> = {
  JALAN_RUSAK: '🛣️', LAMPU_MATI: '💡', SAMPAH: '🗑️',
  DRAINASE: '💧', KEAMANAN: '🔒', SOSIAL: '👥', LAINNYA: '📋',
}

export default function PengaduanCard({ id, judul, deskripsi, kategori, lokasi, status, tanggalLapor, catatanAdmin }: PengaduanCardProps) {
  const cfg = statusConfig[status]
  return (
    <Link href={`/pengaduan/${id}`} className="block">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-green-100 transition-all">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{kategoriEmoji[kategori] || '📋'}</span>
            <p className="font-semibold text-gray-900 text-sm">{judul}</p>
          </div>
          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 ml-8">{deskripsi}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400 ml-8">
          <span>📍 {lokasi}</span>
          <span>·</span>
          <span>{format(new Date(tanggalLapor), 'd MMM yyyy', { locale: idLocale })}</span>
        </div>
        {catatanAdmin && (
          <div className="mt-3 ml-8 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
            💬 {catatanAdmin}
          </div>
        )}
      </div>
    </Link>
  )
}