'use client'

import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

type StatusPengaduan = 'DITERIMA' | 'DICEK' | 'DIPROSES' | 'SELESAI' | 'DITOLAK'

interface PengaduanItem {
  id: string
  judul: string
  kategori: string
  lokasi: string
  status: StatusPengaduan
  prioritas: number
  tanggalLapor: string | Date
  user: { nama: string }
}

interface PengaduanTableProps {
  data: PengaduanItem[]
  onView?: (id: string) => void
  onUpdateStatus?: (id: string) => void
}

const statusConfig: Record<StatusPengaduan, { label: string; variant: 'blue' | 'yellow' | 'orange' | 'green' | 'red' }> = {
  DITERIMA: { label: 'Diterima', variant: 'blue' },
  DICEK:    { label: 'Dicek',    variant: 'yellow' },
  DIPROSES: { label: 'Diproses', variant: 'orange' },
  SELESAI:  { label: 'Selesai',  variant: 'green' },
  DITOLAK:  { label: 'Ditolak',  variant: 'red' },
}

const kategoriEmoji: Record<string, string> = {
  JALAN_RUSAK: '🛣️', LAMPU_MATI: '💡', SAMPAH: '🗑️',
  DRAINASE: '💧', KEAMANAN: '🔒', SOSIAL: '👥', LAINNYA: '📋',
}

const prioritasLabel = ['', '🔴 Darurat', '🟠 Tinggi', '🟡 Sedang', '🟢 Rendah', '⚪ Sangat Rendah']

export default function PengaduanTable({ data, onView, onUpdateStatus }: PengaduanTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-3xl mb-2">📢</p>
        <p className="text-sm">Belum ada pengaduan masuk</p>
      </div>
    )
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Pelapor</Th>
          <Th>Judul</Th>
          <Th>Kategori</Th>
          <Th>Prioritas</Th>
          <Th>Tanggal</Th>
          <Th>Status</Th>
          <Th>Aksi</Th>
        </tr>
      </Thead>
      <Tbody>
        {data.map(p => (
          <Tr key={p.id}>
            <Td className="font-medium text-gray-900">{p.user.nama}</Td>
            <Td>
              <p className="max-w-xs truncate font-medium text-gray-800">{p.judul}</p>
              <p className="text-xs text-gray-400">📍 {p.lokasi}</p>
            </Td>
            <Td>{kategoriEmoji[p.kategori] || '📋'} {p.kategori.replace('_', ' ')}</Td>
            <Td className="text-xs">{prioritasLabel[p.prioritas] || '-'}</Td>
            <Td className="text-xs text-gray-500">
              {format(new Date(p.tanggalLapor), 'd MMM yyyy', { locale: id })}
            </Td>
            <Td>
              <Badge variant={statusConfig[p.status].variant} dot>
                {statusConfig[p.status].label}
              </Badge>
            </Td>
            <Td>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onView?.(p.id)}>Detail</Button>
                {p.status !== 'SELESAI' && p.status !== 'DITOLAK' && (
                  <Button size="sm" onClick={() => onUpdateStatus?.(p.id)}>Update</Button>
                )}
              </div>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}