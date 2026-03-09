// app/(admin)/admin/kartu-keluarga/[id]/edit/page.tsx

import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import EditKKForm from '@/components/EditKKForm'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditKKPage({ params }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { id } = await params

  const kk = await prisma.kartuKeluarga.findUnique({
    where: { id },
    select: {
      id: true,
      noKK: true,
      namaKepala: true,
      alamat: true,
      rt: true,
      rw: true,
      kelurahan: true,
      kecamatan: true,
      kabupaten: true,
      provinsi: true,
    },
  })

  if (!kk) notFound()

  return (
    <div>
      <HeaderPage
        title="Edit Kartu Keluarga"
        subtitle={`Mengubah data KK · ${kk.noKK}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Kartu Keluarga', href: '/admin/kartu-keluarga' },
          { label: kk.namaKepala, href: `/admin/kartu-keluarga/${id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="max-w-3xl">
        <EditKKForm kk={kk} />
      </div>
    </div>
  )
}