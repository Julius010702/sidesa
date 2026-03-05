import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderAdmin from '@/components/layout/HeaderAdmin'
import InfrastrukturEditClient from './InfrastrukturEditClient'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InfrastrukturDetailPage({ params }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { id } = await params

  const item = await prisma.infrastruktur.findUnique({
    where: { id },
  })

  if (!item) notFound()

  return (
    <div>
      <HeaderAdmin
        title={item.nama}
        subtitle={`${item.kategori} · ${item.lokasi}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Infrastruktur', href: '/admin/infrastruktur' },
          { label: item.nama },
        ]}
      />
      <InfrastrukturEditClient
        item={{
          id: item.id,
          nama: item.nama,
          kategori: item.kategori,
          lokasi: item.lokasi,
          deskripsi: item.deskripsi,
          kondisi: item.kondisi,
          foto: item.foto,
          status: item.status,
          catatan: item.catatan,
        }}
      />
    </div>
  )
}