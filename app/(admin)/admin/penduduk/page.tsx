import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { hitungUmur } from '@/lib/utils'
import { JenisKelamin } from '@prisma/client'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

async function getPendudukList(search: string, page: number) {
  const limit = 20
  const skip = (page - 1) * limit
  const where = search
    ? {
        OR: [
          { nama: { contains: search, mode: 'insensitive' as const } },
          { nik: { contains: search } },
          { noKK: { contains: search } },
          { alamat: { contains: search, mode: 'insensitive' as const } },
        ],
        statusHidup: true,
      }
    : { statusHidup: true }

  const [data, total] = await Promise.all([
    prisma.penduduk.findMany({
      where,
      orderBy: { nama: 'asc' },
      skip,
      take: limit,
      select: {
        id: true,
        nama: true,
        nik: true,
        noKK: true,
        jenisKelamin: true,
        tanggalLahir: true,
        pekerjaan: true,
        statusKawin: true,
        // ✅ Ambil fotoUrl dari relasi user
        user: {
          select: {
            fotoUrl: true,
            isVerified: true,
          },
        },
      },
    }),
    prisma.penduduk.count({ where }),
  ])

  return { data, total, totalPages: Math.ceil(total / limit) }
}

type PendudukList = Awaited<ReturnType<typeof getPendudukList>>
type PendudukItem = PendudukList['data'][number]

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function AdminPendudukPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { q = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr))
  const { data, total, totalPages } = await getPendudukList(q, page)

  return (
    <div>
      <HeaderPage
        title="Data Penduduk"
        subtitle={`${total.toLocaleString('id-ID')} penduduk terdaftar`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Penduduk' },
        ]}
        action={
          <Link
            href="/admin/penduduk/tambah"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Penduduk
          </Link>
        }
      />

      {/* Search */}
      <form method="GET" className="mb-5">
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama, NIK, atau No. KK..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            Cari
          </button>
        </div>
      </form>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-gray-700 font-semibold text-base">
            {q ? `Tidak ada hasil untuk "${q}"` : 'Belum ada data penduduk'}
          </p>
          <p className="text-gray-500 text-sm mt-1 mb-4">
            {q ? 'Coba kata kunci lain' : 'Mulai tambahkan data penduduk'}
          </p>
          <Link
            href="/admin/penduduk/tambah"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Tambah Penduduk Pertama
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
              <div className="col-span-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Nama / NIK</div>
              <div className="col-span-2 text-xs font-bold text-gray-600 uppercase tracking-wider">L/P · Umur</div>
              <div className="col-span-2 text-xs font-bold text-gray-600 uppercase tracking-wider">Status Kawin</div>
              <div className="col-span-2 text-xs font-bold text-gray-600 uppercase tracking-wider">Pekerjaan</div>
              <div className="col-span-2 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Aksi</div>
            </div>

            <div className="divide-y divide-gray-100">
              {data.map((p: PendudukItem) => (
                <div
                  key={p.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-blue-50/30 transition-colors items-center"
                >
                  {/* Nama & NIK */}
                  <div className="md:col-span-4 flex items-center gap-3">
                    {/* ✅ Foto profil atau inisial */}
                    <div className="relative shrink-0">
                      {p.user?.fotoUrl ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                          <Image
                            src={p.user.fotoUrl}
                            alt={p.nama}
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                          p.jenisKelamin === JenisKelamin.LAKI_LAKI
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {p.nama.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Badge verifikasi */}
                      {p.user?.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border border-white flex items-center justify-center" title="Terverifikasi">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.nama}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{p.nik}</p>
                    </div>
                  </div>

                  {/* JK & Umur */}
                  <div className="md:col-span-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.jenisKelamin === JenisKelamin.LAKI_LAKI
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {p.jenisKelamin === JenisKelamin.LAKI_LAKI ? 'Laki-laki' : 'Perempuan'}
                    </span>
                    <p className="text-xs text-gray-600 font-medium mt-1">
                      {hitungUmur(p.tanggalLahir)} tahun
                    </p>
                  </div>

                  {/* Status Kawin */}
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-800">
                      {p.statusKawin?.replace(/_/g, ' ') ?? '-'}
                    </p>
                  </div>

                  {/* Pekerjaan */}
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.pekerjaan ?? '-'}</p>
                  </div>

                  {/* Aksi */}
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Link
                      href={`/admin/penduduk/${p.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200"
                    >
                      Detail
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs font-medium text-gray-600">
                Halaman {page} dari {totalPages} · {total} total penduduk
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/penduduk?page=${page - 1}${q ? `&q=${q}` : ''}`}
                    className="px-3 py-1.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Sebelumnya
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/penduduk?page=${page + 1}${q ? `&q=${q}` : ''}`}
                    className="px-3 py-1.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Berikutnya →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}