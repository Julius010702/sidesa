import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import EditPendudukClient from './EditPendudukClient'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPendudukPage({ params }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { id } = await params
  const penduduk = await prisma.penduduk.findUnique({ where: { id } })
  if (!penduduk) notFound()

  return (
    <div>
      <HeaderPage
        title="Edit Data Penduduk"
        subtitle={penduduk.nama}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Penduduk', href: '/admin/penduduk' },
          { label: penduduk.nama, href: `/admin/penduduk/${id}` },
          { label: 'Edit' },
        ]}
      />
      <EditPendudukClient penduduk={{
        id:           penduduk.id,
        nik:          penduduk.nik,
        noKK:         penduduk.noKK ?? '',
        nama:         penduduk.nama,
        jenisKelamin: penduduk.jenisKelamin,
        tempatLahir:  penduduk.tempatLahir,
        tanggalLahir: penduduk.tanggalLahir.toISOString().split('T')[0],
        agama:        penduduk.agama,
        statusKawin:  penduduk.statusKawin,
        pendidikan:   penduduk.pendidikan ?? '',
        pekerjaan:    penduduk.pekerjaan ?? '',
        golonganDarah: penduduk.golonganDarah ?? '',
        alamat:       penduduk.alamat,
        rt:           penduduk.rt,
        rw:           penduduk.rw,
        dusun:        penduduk.dusun ?? '',
        kelurahan:    penduduk.kelurahan,
        kecamatan:    penduduk.kecamatan,
        kabupaten:    penduduk.kabupaten,
        provinsi:     penduduk.provinsi,
        kodePos:      penduduk.kodePos ?? '',
        keterangan:   penduduk.keterangan ?? '',
      }} />
    </div>
  )
}