import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { formatTanggal, truncate } from '@/lib/utils'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function AdminBeritaPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { q = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr))
  const limit = 15
  const skip = (page - 1) * limit

  const where = q
    ? { OR: [{ judul: { contains: q, mode: 'insensitive' as const } }, { kategori: { contains: q, mode: 'insensitive' as const } }] }
    : {}

  const [data, total] = await Promise.all([
    prisma.berita.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
      include: { author: { select: { nama: true } } },
    }),
    prisma.berita.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <HeaderPage
        title="Berita & Pengumuman"
        subtitle={`${total} artikel`}
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Berita' }]}
        action={
          <Link href="/admin/berita/tulis"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tulis Berita
          </Link>
        }
      />

      <form method="GET" className="mb-5">
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input name="q" defaultValue={q} placeholder="Cari judul atau kategori..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Cari</button>
        </div>
      </form>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">📰</div>
          <p className="text-gray-500 font-medium">Belum ada berita</p>
          <Link href="/admin/berita/tulis" className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
            Tulis Berita Pertama
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.map((b) => (
              <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4">
                {b.fotoUrl ? (
                  <Image
                    src={b.fotoUrl}
                    alt={b.judul}
                    width={80}
                    height={64}
                    className="w-20 h-16 object-cover rounded-xl shrink-0"
                  />
                ) : (
                  <div className="w-20 h-16 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center text-2xl">📰</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{b.kategori}</span>
                        {b.isPinned && <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full">📌 Pinned</span>}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {b.isPublished ? 'Dipublikasikan' : 'Draft'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">{b.judul}</h3>
                      {b.excerpt && <p className="text-xs text-gray-400 mt-0.5">{truncate(b.excerpt, 80)}</p>}
                    </div>
                    <Link href={`/admin/berita/${b.id}`}
                      className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                      Edit
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {b.author.nama} · {formatTanggal(b.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">Halaman {page} dari {totalPages}</p>
              <div className="flex gap-2">
                {page > 1 && <Link href={`/admin/berita?page=${page - 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">← Sebelumnya</Link>}
                {page < totalPages && <Link href={`/admin/berita?page=${page + 1}${q ? `&q=${q}` : ''}`} className="px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Berikutnya →</Link>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}