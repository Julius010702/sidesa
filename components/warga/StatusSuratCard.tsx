import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

type StatusSurat = 'PENDING' | 'DIPROSES' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI'

interface StatusSuratCardProps {
  id: string
  nomorSurat?: string | null
  jenisSurat: string
  keperluan: string
  status: StatusSurat
  tanggalDiajukan: string | Date
  catatanAdmin?: string | null
}

const statusConfig: Record<StatusSurat, { label: string; variant: 'yellow' | 'blue' | 'green' | 'red' | 'gray' }> = {
  PENDING:   { label: 'Menunggu',  variant: 'yellow' },
  DIPROSES:  { label: 'Diproses',  variant: 'blue' },
  DISETUJUI: { label: 'Disetujui', variant: 'green' },
  DITOLAK:   { label: 'Ditolak',   variant: 'red' },
  SELESAI:   { label: 'Selesai',   variant: 'gray' },
}

const jenisSuratLabel: Record<string, string> = {
  DOMISILI: 'Keterangan Domisili',
  KETERANGAN_USAHA: 'Keterangan Usaha',
  TIDAK_MAMPU: 'Keterangan Tidak Mampu',
  PENGANTAR_KTP: 'Pengantar KTP',
  PENGANTAR_KK: 'Pengantar KK',
  PENGANTAR_SKCK: 'Pengantar SKCK',
  LAINNYA: 'Lainnya',
}

export default function StatusSuratCard({
  id, nomorSurat, jenisSurat, keperluan, status, tanggalDiajukan, catatanAdmin
}: StatusSuratCardProps) {
  const cfg = statusConfig[status]
  return (
    <Link href={`/surat/${id}`} className="block">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-green-100 transition-all">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{jenisSuratLabel[jenisSurat] || jenisSurat}</p>
            {nomorSurat && <p className="text-xs text-gray-400 mt-0.5">{nomorSurat}</p>}
          </div>
          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{keperluan}</p>
        {catatanAdmin && status === 'DITOLAK' && (
          <div className="bg-red-50 rounded-lg px-3 py-2 text-xs text-red-600 mb-3">
            Alasan: {catatanAdmin}
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Diajukan {format(new Date(tanggalDiajukan), 'd MMM yyyy', { locale: idLocale })}
          </p>
          <span className="text-xs text-green-600 font-medium">Lihat Detail →</span>
        </div>
      </div>
    </Link>
  )
}