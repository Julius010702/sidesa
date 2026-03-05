'use client'

import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

type StatusBansos = 'AKTIF' | 'TIDAK_AKTIF' | 'PENDING'

interface BansosItem {
  id: string
  jenisBansos: string
  status: StatusBansos
  tahun: number
  nominal?: number | null
  tanggalMulai?: string | Date | null
  tanggalAkhir?: string | Date | null
  penduduk: { nama: string; nik: string }
}

interface BansosTableProps {
  data: BansosItem[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

const statusConfig: Record<StatusBansos, { label: string; variant: 'green' | 'gray' | 'yellow' }> = {
  AKTIF:       { label: 'Aktif',       variant: 'green' },
  TIDAK_AKTIF: { label: 'Tidak Aktif', variant: 'gray' },
  PENDING:     { label: 'Pending',     variant: 'yellow' },
}

export default function BansosTable({ data, onView, onEdit }: BansosTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-3xl mb-2">💰</p>
        <p className="text-sm">Belum ada data bansos</p>
      </div>
    )
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Penerima</Th>
          <Th>Jenis</Th>
          <Th>Tahun</Th>
          <Th>Nominal</Th>
          <Th>Periode</Th>
          <Th>Status</Th>
          <Th>Aksi</Th>
        </tr>
      </Thead>
      <Tbody>
        {data.map(b => (
          <Tr key={b.id}>
            <Td>
              <p className="font-medium text-gray-900">{b.penduduk.nama}</p>
              <p className="text-xs text-gray-400 font-mono">{b.penduduk.nik}</p>
            </Td>
            <Td>
              <Badge variant="green">{b.jenisBansos}</Badge>
            </Td>
            <Td className="text-gray-600">{b.tahun}</Td>
            <Td className="font-medium text-gray-900">
              {b.nominal ? `Rp ${b.nominal.toLocaleString('id-ID')}` : '-'}
            </Td>
            <Td className="text-xs text-gray-500">
              {b.tanggalMulai ? format(new Date(b.tanggalMulai), 'MMM yyyy', { locale: id }) : '-'}
              {b.tanggalAkhir ? ` – ${format(new Date(b.tanggalAkhir), 'MMM yyyy', { locale: id })}` : ''}
            </Td>
            <Td>
              <Badge variant={statusConfig[b.status].variant} dot>
                {statusConfig[b.status].label}
              </Badge>
            </Td>
            <Td>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onView?.(b.id)}>Detail</Button>
                <Button size="sm" variant="outline" onClick={() => onEdit?.(b.id)}>Edit</Button>
              </div>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}