import Badge from '@/components/ui/Badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

type StatusBansos = 'AKTIF' | 'TIDAK_AKTIF' | 'PENDING'

interface BansosCardProps {
  jenisBansos: string
  status: StatusBansos
  tahun: number
  nominal?: number | null
  keterangan?: string | null
  tanggalMulai?: string | Date | null
  tanggalAkhir?: string | Date | null
}

const statusConfig: Record<StatusBansos, { label: string; variant: 'green' | 'gray' | 'yellow' }> = {
  AKTIF:      { label: 'Aktif',       variant: 'green' },
  TIDAK_AKTIF:{ label: 'Tidak Aktif', variant: 'gray' },
  PENDING:    { label: 'Pending',     variant: 'yellow' },
}

const jenisInfo: Record<string, { label: string; icon: string; desc: string }> = {
  PKH:    { label: 'PKH', icon: '👨‍👩‍👧', desc: 'Program Keluarga Harapan' },
  BLT:    { label: 'BLT', icon: '💵', desc: 'Bantuan Langsung Tunai' },
  BPNT:   { label: 'BPNT', icon: '🛒', desc: 'Bantuan Pangan Non Tunai' },
  KIP:    { label: 'KIP', icon: '🎓', desc: 'Kartu Indonesia Pintar' },
  LAINNYA:{ label: 'Lainnya', icon: '📦', desc: 'Bantuan Sosial Lainnya' },
}

export default function BansosCard({ jenisBansos, status, tahun, nominal, keterangan, tanggalMulai, tanggalAkhir }: BansosCardProps) {
  const cfg = statusConfig[status]
  const info = jenisInfo[jenisBansos] || jenisInfo.LAINNYA

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">
            {info.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{info.label}</p>
            <p className="text-xs text-gray-400">{info.desc} · {tahun}</p>
          </div>
        </div>
        <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
      </div>

      {nominal && (
        <div className="bg-green-50 rounded-xl px-4 py-3 mb-3">
          <p className="text-xs text-gray-500 mb-0.5">Nominal Bantuan</p>
          <p className="font-bold text-green-700 text-lg">
            Rp {nominal.toLocaleString('id-ID')}
          </p>
        </div>
      )}

      {(tanggalMulai || tanggalAkhir) && (
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          {tanggalMulai && (
            <span>Mulai: {format(new Date(tanggalMulai), 'd MMM yyyy', { locale: id })}</span>
          )}
          {tanggalAkhir && (
            <span>Berakhir: {format(new Date(tanggalAkhir), 'd MMM yyyy', { locale: id })}</span>
          )}
        </div>
      )}

      {keterangan && (
        <p className="text-xs text-gray-400 border-t border-gray-50 pt-3">{keterangan}</p>
      )}
    </div>
  )
}