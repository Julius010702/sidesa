'use client'

import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface PendudukItem {
  id: string
  nik: string
  nama: string
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN'
  tanggalLahir: string | Date
  alamat: string
  rt: string
  rw: string
  pekerjaan?: string | null
  statusKawin: string
  agama: string
}

interface PendudukTableProps {
  data: PendudukItem[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

export default function PendudukTable({ data, onView, onEdit }: PendudukTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-3xl mb-2">👥</p>
        <p className="text-sm">Belum ada data penduduk</p>
      </div>
    )
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Nama Penduduk</Th>
          <Th>NIK</Th>
          <Th>L/P</Th>
          <Th>TTL</Th>
          <Th>Alamat</Th>
          <Th>Status Kawin</Th>
          <Th>Aksi</Th>
        </tr>
      </Thead>
      <Tbody>
        {data.map(p => (
          <Tr key={p.id}>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={p.nama} size="sm" />
                <div>
                  <p className="font-medium text-gray-900">{p.nama}</p>
                  <p className="text-xs text-gray-400">{p.pekerjaan || '-'}</p>
                </div>
              </div>
            </Td>
            <Td className="font-mono text-xs text-gray-600">{p.nik}</Td>
            <Td>
              <Badge variant={p.jenisKelamin === 'LAKI_LAKI' ? 'blue' : 'purple'}>
                {p.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P'}
              </Badge>
            </Td>
            <Td className="text-xs text-gray-600">
              {format(new Date(p.tanggalLahir), 'd MMM yyyy', { locale: id })}
            </Td>
            <Td className="text-xs text-gray-600">
              RT {p.rt}/RW {p.rw}
            </Td>
            <Td>
              <span className="text-xs text-gray-600">{p.statusKawin.replace('_', ' ')}</span>
            </Td>
            <Td>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onView?.(p.id)}>Detail</Button>
                <Button size="sm" variant="outline" onClick={() => onEdit?.(p.id)}>Edit</Button>
              </div>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}