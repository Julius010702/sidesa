'use client'

import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

type StatusSurat = 'PENDING' | 'DIPROSES' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI'

interface SuratItem {
  id: string
  nomorSurat?: string | null
  jenisSurat: string
  keperluan: string
  status: StatusSurat
  tanggalDiajukan: string | Date
  user: { nama: string; nik: string }
}

interface SuratTableProps {
  data: SuratItem[]
  onProcess?: (id: string) => void
  onView?: (id: string) => void
}

const statusConfig: Record<StatusSurat, { label: string; variant: 'yellow' | 'blue' | 'green' | 'red' | 'gray' }> = {
  PENDING:   { label: 'Menunggu',  variant: 'yellow' },
  DIPROSES:  { label: 'Diproses',  variant: 'blue' },
  DISETUJUI: { label: 'Disetujui', variant: 'green' },
  DITOLAK:   { label: 'Ditolak',   variant: 'red' },
  SELESAI:   { label: 'Selesai',   variant: 'gray' },
}

const jenisSuratLabel: Record<string, string> = {
  DOMISILI: 'Domisili', KETERANGAN_USAHA: 'Usaha', TIDAK_MAMPU: 'Tidak Mampu',
  PENGANTAR_KTP: 'Pengantar KTP', PENGANTAR_KK: 'Pengantar KK', PENGANTAR_SKCK: 'Pengantar SKCK', LAINNYA: 'Lainnya',
}

export default function SuratTable({ data, onProcess, onView }: SuratTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-3xl mb-2">📄</p>
        <p className="text-sm">Belum ada pengajuan surat</p>
      </div>
    )
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Pemohon</Th>
          <Th>Jenis Surat</Th>
          <Th>Keperluan</Th>
          <Th>Tanggal</Th>
          <Th>Status</Th>
          <Th>Aksi</Th>
        </tr>
      </Thead>
      <Tbody>
        {data.map(s => (
          <Tr key={s.id}>
            <Td>
              <p className="font-medium text-gray-900">{s.user.nama}</p>
              <p className="text-xs text-gray-400">{s.user.nik}</p>
            </Td>
            <Td>{jenisSuratLabel[s.jenisSurat] || s.jenisSurat}</Td>
            <Td>
              <p className="max-w-xs truncate text-gray-600">{s.keperluan}</p>
            </Td>
            <Td className="text-gray-500 text-xs">
              {format(new Date(s.tanggalDiajukan), 'd MMM yyyy', { locale: id })}
            </Td>
            <Td>
              <Badge variant={statusConfig[s.status].variant} dot>
                {statusConfig[s.status].label}
              </Badge>
            </Td>
            <Td>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onView?.(s.id)}>Detail</Button>
                {s.status === 'PENDING' && (
                  <Button size="sm" onClick={() => onProcess?.(s.id)}>Proses</Button>
                )}
              </div>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}