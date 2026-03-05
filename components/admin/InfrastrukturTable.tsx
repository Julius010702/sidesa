'use client'

import { Table, Thead, Tbody, Th, Td, Tr } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface InfrastrukturItem {
  id: string
  nama: string
  kategori: string
  lokasi: string
  kondisi: string
  status: string
  catatan?: string | null
  updatedAt: string | Date
}

interface InfrastrukturTableProps {
  data: InfrastrukturItem[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

function getKondisiVariant(kondisi: string): 'green' | 'yellow' | 'red' | 'gray' {
  if (kondisi === 'BAIK') return 'green'
  if (kondisi === 'SEDANG') return 'yellow'
  if (kondisi === 'RUSAK') return 'red'
  return 'gray'
}

const kategoriEmoji: Record<string, string> = {
  Jalan: '🛣️', Jembatan: '🌉', Gedung: '🏢', Ibadah: '🕌',
  Sekolah: '🏫', Kesehatan: '🏥', Air: '💧', Lainnya: '🔧',
}

export default function InfrastrukturTable({ data, onView, onEdit }: InfrastrukturTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-3xl mb-2">🏗️</p>
        <p className="text-sm">Belum ada data infrastruktur</p>
      </div>
    )
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Nama Infrastruktur</Th>
          <Th>Kategori</Th>
          <Th>Lokasi</Th>
          <Th>Kondisi</Th>
          <Th>Status</Th>
          <Th>Update Terakhir</Th>
          <Th>Aksi</Th>
        </tr>
      </Thead>
      <Tbody>
        {data.map(inf => (
          <Tr key={inf.id}>
            <Td>
              <p className="font-medium text-gray-900">{inf.nama}</p>
              {inf.catatan && <p className="text-xs text-red-500 mt-0.5 line-clamp-1">{inf.catatan}</p>}
            </Td>
            <Td>{kategoriEmoji[inf.kategori] || '🔧'} {inf.kategori}</Td>
            <Td className="text-gray-600 text-xs">{inf.lokasi}</Td>
            <Td>
              <Badge variant={getKondisiVariant(inf.kondisi)} dot>{inf.kondisi}</Badge>
            </Td>
            <Td>
              <span className="text-xs text-gray-600">{inf.status}</span>
            </Td>
            <Td className="text-xs text-gray-400">
              {format(new Date(inf.updatedAt), 'd MMM yyyy', { locale: id })}
            </Td>
            <Td>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onView?.(inf.id)}>Detail</Button>
                <Button size="sm" variant="outline" onClick={() => onEdit?.(inf.id)}>Edit</Button>
              </div>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}