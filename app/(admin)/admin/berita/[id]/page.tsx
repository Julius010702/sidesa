import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import EditBeritaClient from './EditBeritaClient'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BeritaDetailPage({ params }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { id } = await params
  const berita = await prisma.berita.findUnique({
    where: { id },
    include: { author: { select: { nama: true } } },
  })

  if (!berita) notFound()

  return (
    <div>
      <HeaderPage
        title="Edit Berita"
        subtitle={berita.judul}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Berita', href: '/admin/berita' },
          { label: 'Edit' },
        ]}
      />
      <EditBeritaClient
        berita={{
          id: berita.id,
          judul: berita.judul,
          konten: berita.konten,
          kategori: berita.kategori,
          excerpt: berita.excerpt,
          tags: berita.tags,
          isPublished: berita.isPublished,
          isPinned: berita.isPinned,
          fotoUrl: berita.fotoUrl,
        }}
      />
    </div>
  )
}