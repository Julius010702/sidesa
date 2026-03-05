import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'

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
      include: { _count: { select: { anggota: true } } },
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
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Kartu Keluarga' }]}
      />

      {/* Search */}
      <form method="GET" className="mb-5">
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input name="q" defaultValue={q} placeholder="Cari No. KK atau nama kepala keluarga..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
          </div>
          <button type="submit"
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            Cari
          </button>
        </div>
      </form>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">🏠</div>
          <p className="text-gray-500 font-medium">
            {q ? `Tidak ada hasil untuk "${q}"` : 'Belum ada Kartu Keluarga terdaftar'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.map((kk: KKItem) => (
              <Link
                key={kk.id}
                href={`/admin/kartu-keluarga/${kk.id}`}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{kk.namaKepala}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{kk.noKK}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{kk.alamat}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold text-indigo-700">{kk._count.anggota}</p>
                    <p className="text-xs text-gray-400">Anggota</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">Halaman {page} dari {totalPages}</p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/kartu-keluarga?page=${page - 1}${q ? `&q=${q}` : ''}`}
                    className="px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">← Sebelumnya</Link>
                )}
                {page < totalPages && (
                  <Link href={`/admin/kartu-keluarga?page=${page + 1}${q ? `&q=${q}` : ''}`}
                    className="px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Berikutnya →</Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}