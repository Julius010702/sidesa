import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { hitungUmur } from '@/lib/utils'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

async function getKK(id: string) {
  return prisma.kartuKeluarga.findUnique({
    where: { id },
    include: {
      anggota: {
        where: { statusHidup: true },
        orderBy: { nama: 'asc' },
        select: {
          id: true,
          nama: true,
          nik: true,
          jenisKelamin: true,
          tanggalLahir: true,
          agama: true,
          pendidikan: true,
          pekerjaan: true,
          statusKawin: true,        // ✅ fix: was statusPerkawinan
          statusHidup: true,
        },
      },
    },
  })
}

type KKDetail = NonNullable<Awaited<ReturnType<typeof getKK>>>
type Anggota = KKDetail['anggota'][number]

// Urutan hubungan diambil dari field statusKawin + pekerjaan saja
// karena Penduduk tidak punya field hubunganDenganKepala di schema

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetailKKPage({ params }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { id } = await params
  const kk = await getKK(id)
  if (!kk) notFound()

  return (
    <div>
      <HeaderPage
        title="Detail Kartu Keluarga"
        subtitle={`No. KK: ${kk.noKK}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Kartu Keluarga', href: '/admin/kartu-keluarga' },
          { label: kk.namaKepala },
        ]}
        action={
          <Link
            href="/admin/penduduk/tambah"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Anggota
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Info KK */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">{kk.namaKepala}</h2>
                <p className="text-xs text-gray-400 font-mono">{kk.noKK}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Alamat', value: kk.alamat },
                { label: 'RT / RW', value: `${kk.rt ?? '-'} / ${kk.rw ?? '-'}` },
                { label: 'Kelurahan', value: kk.kelurahan },
                { label: 'Kecamatan', value: kk.kecamatan },
                { label: 'Kabupaten', value: kk.kabupaten },
                { label: 'Provinsi', value: kk.provinsi },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400 w-24 shrink-0">{item.label}</span>
                  <span className="text-gray-700 font-medium">{item.value ?? '-'}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Total anggota</span>
              <span className="text-lg font-bold text-indigo-700">{kk.anggota.length} orang</span>
            </div>
          </div>

          {/* Statistik */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Statistik KK</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-700">
                  {kk.anggota.filter((a: Anggota) => a.jenisKelamin === 'LAKI_LAKI').length}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Laki-laki</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-pink-700">
                  {kk.anggota.filter((a: Anggota) => a.jenisKelamin === 'PEREMPUAN').length}
                </p>
                <p className="text-xs text-pink-600 mt-0.5">Perempuan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Anggota */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-sm">Anggota Keluarga</h2>
              <span className="text-xs text-gray-400">{kk.anggota.length} orang</span>
            </div>

            {kk.anggota.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-gray-400 text-sm">Belum ada anggota terdaftar</p>
                <Link href="/admin/penduduk/tambah" className="mt-2 text-xs text-blue-600 hover:underline">
                  Tambah anggota
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {kk.anggota.map((a: Anggota, i) => (
                  <Link
                    key={a.id}
                    href={`/admin/penduduk/${a.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    {/* No urut */}
                    <span className="text-xs text-gray-300 font-mono w-4 shrink-0">{i + 1}</span>

                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      a.jenisKelamin === 'LAKI_LAKI' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {a.nama.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{a.nama}</p>
                      <p className="text-xs text-gray-400 font-mono">{a.nik}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {hitungUmur(a.tanggalLahir)} th ·{' '}
                        {a.pekerjaan ?? '-'}
                      </p>
                    </div>

                    {/* Status kawin + arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500 hidden sm:block">
                        {a.statusKawin?.replace(/_/g, ' ') ?? '-'}
                      </span>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}