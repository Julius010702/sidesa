// app/(admin)/admin/kartu-keluarga/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import DeleteKKButton from '@/components/DeleteKKButton'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

async function getKKList(search: string, page: number) {
  const limit = 20
  const skip = (page - 1) * limit
  const where = search
    ? {
        OR: [
          { noKK: { contains: search } },
          { namaKepala: { contains: search, mode: 'insensitive' as const } },
          { alamat: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [data, total] = await Promise.all([
    prisma.kartuKeluarga.findMany({
      where,
      orderBy: { namaKepala: 'asc' },
      skip,
      take: limit,
      include: {
        // Hanya hitung anggota yang statusHidup: true
        anggota: {
          where: { statusHidup: true },
          select: { id: true },
        },
      },
    }),
    prisma.kartuKeluarga.count({ where }),
  ])

  return { data, total, totalPages: Math.ceil(total / limit) }
}

type KKList = Awaited<ReturnType<typeof getKKList>>
type KKItem = KKList['data'][number]

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function AdminKKPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { q = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr))
  const { data, total, totalPages } = await getKKList(q, page)

  return (
    <div>
      <HeaderPage
        title="Kartu Keluarga"
        subtitle={`${total.toLocaleString('id-ID')} KK terdaftar`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Kartu Keluarga' },
        ]}
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
              placeholder="Cari No. KK atau nama kepala keluarga..."
              suppressHydrationWarning
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <button
            type="submit"
            suppressHydrationWarning
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Cari
          </button>
        </div>
      </form>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-16 text-center shadow-sm">
          <div className="text-5xl mb-3">🏠</div>
          <p className="text-gray-800 font-semibold text-base">
            {q ? `Tidak ada hasil untuk "${q}"` : 'Belum ada Kartu Keluarga terdaftar'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {q ? 'Coba kata kunci lain' : 'Data KK akan muncul di sini'}
          </p>
        </div>
      ) : (
        <>
          {/* Header kolom */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-2">
            <div className="col-span-1 text-xs font-bold text-gray-600 uppercase tracking-wider">#</div>
            <div className="col-span-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Kepala Keluarga</div>
            <div className="col-span-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Alamat</div>
            <div className="col-span-2 text-xs font-bold text-gray-600 uppercase tracking-wider">Anggota</div>
            <div className="col-span-2 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Aksi</div>
          </div>

          <div className="space-y-2">
            {data.map((kk: KKItem, i) => (
              <div
                key={kk.id}
                className="bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Nomor */}
                  <div className="hidden md:block col-span-1">
                    <span className="text-sm font-bold text-gray-500">{(page - 1) * 20 + i + 1}</span>
                  </div>

                  {/* Kepala Keluarga */}
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{kk.namaKepala}</p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{kk.noKK}</p>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="md:col-span-4">
                    <p className="text-sm font-medium text-gray-700 truncate">{kk.alamat}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      RT {kk.rt} / RW {kk.rw} · {kk.kelurahan}
                    </p>
                  </div>

                  {/* Jumlah Anggota — pakai kk.anggota.length (sudah difilter statusHidup: true) */}
                  <div className="md:col-span-2">
                    <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
                      <span className="text-lg font-bold text-indigo-700">{kk.anggota.length}</span>
                      <span className="text-xs font-semibold text-indigo-600">anggota</span>
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                    <Link
                      href={`/admin/kartu-keluarga/${kk.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="hidden lg:inline">Edit</span>
                    </Link>
                    <Link
                      href={`/admin/kartu-keluarga/${kk.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden lg:inline">Detail</span>
                    </Link>
                    {/* bisaDihapus pakai anggota.length yang sudah difilter statusHidup: true */}
                    <DeleteKKButton id={kk.id} bisaDihapus={kk.anggota.length === 0} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs font-medium text-gray-600">
                Halaman {page} dari {totalPages} · {total} total KK
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/kartu-keluarga?page=${page - 1}${q ? `&q=${q}` : ''}`}
                    className="px-3 py-1.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Sebelumnya
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/kartu-keluarga?page=${page + 1}${q ? `&q=${q}` : ''}`}
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