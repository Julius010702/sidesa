// app/(admin)/admin/kartu-keluarga/[id]/page.tsx

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
          statusKawin: true,
          statusHidup: true,
        },
      },
    },
  })
}

type KKDetail = NonNullable<Awaited<ReturnType<typeof getKK>>>
type Anggota = KKDetail['anggota'][number]

interface PageProps {
  params: Promise<{ id: string }>
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-gray-800">{value || '-'}</span>
    </div>
  )
}

export default async function DetailKKPage({ params }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { id } = await params
  const kk = await getKK(id)
  if (!kk) notFound()

  const jumlahLakiLaki = kk.anggota.filter((a: Anggota) => a.jenisKelamin === 'LAKI_LAKI').length
  const jumlahPerempuan = kk.anggota.filter((a: Anggota) => a.jenisKelamin === 'PEREMPUAN').length
  const bisaDihapus = kk.anggota.length === 0

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
          <div className="flex items-center gap-2">
            {/* Tombol Hapus KK */}
            {bisaDihapus ? (
              <form
                action={async () => {
                  'use server'
                  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/kartu-keluarga/${id}`, {
                    method: 'DELETE',
                  })
                  if (res.ok) redirect('/admin/kartu-keluarga')
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus KK
                </button>
              </form>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-gray-50 text-gray-400 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus KK
                </button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Hapus semua anggota terlebih dahulu sebelum menghapus KK
                </div>
              </div>
            )}

            {/* Tombol Tambah Anggota */}
            <Link
              href="/admin/penduduk/tambah"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Anggota
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sidebar kiri */}
        <div className="space-y-4">
          {/* Info KK */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{kk.namaKepala}</p>
                <p className="text-xs font-mono text-gray-500">{kk.noKK}</p>
              </div>
            </div>
            <div className="p-5">
              <InfoRow label="Alamat" value={kk.alamat} />
              <InfoRow label="RT / RW" value={`${kk.rt ?? '-'} / ${kk.rw ?? '-'}`} />
              <InfoRow label="Kelurahan" value={kk.kelurahan} />
              <InfoRow label="Kecamatan" value={kk.kecamatan} />
              <InfoRow label="Kabupaten" value={kk.kabupaten} />
              <InfoRow label="Provinsi" value={kk.provinsi} />
            </div>
          </div>

          {/* Statistik */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Statistik Anggota</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{kk.anggota.length}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">Total</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{jumlahLakiLaki}</p>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">L</p>
              </div>
              <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-pink-700">{jumlahPerempuan}</p>
                <p className="text-xs font-semibold text-pink-600 mt-0.5">P</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel anggota */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800">👨‍👩‍👧‍👦 Anggota Keluarga</h2>
              <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2.5 py-1 rounded-full">
                {kk.anggota.length} orang
              </span>
            </div>

            {kk.anggota.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="text-4xl mb-3">👤</div>
                <p className="text-gray-700 font-semibold">Belum ada anggota terdaftar</p>
                <Link href="/admin/penduduk/tambah" className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700">
                  + Tambah anggota
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {kk.anggota.map((a: Anggota, i) => (
                  <Link
                    key={a.id}
                    href={`/admin/penduduk/${a.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50/40 transition-colors group"
                  >
                    <span className="text-xs font-bold text-gray-400 w-5 shrink-0 text-center">{i + 1}</span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      a.jenisKelamin === 'LAKI_LAKI' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {a.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                        {a.nama}
                      </p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{a.nik}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                          a.jenisKelamin === 'LAKI_LAKI' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {a.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P'}
                        </span>
                        <span className="text-xs font-medium text-gray-600">
                          {hitungUmur(a.tanggalLahir)} tahun
                        </span>
                        {a.pekerjaan && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs font-medium text-gray-600">{a.pekerjaan}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 hidden sm:block">
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                        {a.statusKawin?.replace(/_/g, ' ') ?? '-'}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
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