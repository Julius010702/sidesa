// app/(admin)/admin/berita/page.tsx
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
      where, orderBy: { createdAt: 'desc' }, skip, take: limit,
      include: { author: { select: { nama: true } } },
    }),
    prisma.berita.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)
  const published = data.filter((b) => b.isPublished).length
  const draft = data.filter((b) => !b.isPublished).length

  return (
    <div>
      <HeaderPage
        title="Berita & Pengumuman"
        subtitle={`${total} artikel`}
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Berita' }]}
        action={
          <Link href="/admin/berita/tulis"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tulis Berita
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-2xl font-bold text-blue-800">{total}</p>
          <p className="text-xs font-semibold text-blue-600 mt-0.5">Total Artikel</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-800">{published}</p>
          <p className="text-xs font-semibold text-green-600 mt-0.5">Dipublikasikan</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-2xl font-bold text-gray-800">{draft}</p>
          <p className="text-xs font-semibold text-gray-600 mt-0.5">Draft</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="mb-5">
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input name="q" defaultValue={q} placeholder="Cari judul atau kategori..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
          </div>
          <button type="submit"
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm">
            Cari
          </button>
        </div>
      </form>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-16 text-center shadow-sm">
          <div className="text-5xl mb-3">📰</div>
          <p className="text-gray-800 font-semibold text-base">Belum ada berita</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Mulai tulis berita atau pengumuman desa</p>
          <Link href="/admin/berita/tulis"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
            Tulis Berita Pertama
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.map((b) => (
              <div key={b.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-4 hover:shadow-md hover:border-blue-200 transition-all">
                {/* Thumbnail */}
                {b.fotoUrl ? (
                  <Image
                    src={b.fotoUrl} alt={b.judul}
                    width={80} height={64}
                    className="w-20 h-16 object-cover rounded-xl shrink-0"
                  />
                ) : (
<div className="w-20 h-16 bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl shrink-0 flex items-center justify-center text-2xl">                    📰
                  </div>
                )}

                {/* Konten */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          {b.kategori}
                        </span>
                        {b.isPinned && (
                          <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                            📌 Pinned
                          </span>
                        )}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          b.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {b.isPublished ? '✅ Dipublikasikan' : '📝 Draft'}
                        </span>
                      </div>

                      {/* Judul */}
                      <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">{b.judul}</h3>

                      {/* Excerpt */}
                      {b.excerpt && (
                        <p className="text-xs font-medium text-gray-600 mt-0.5 line-clamp-1">
                          {truncate(b.excerpt, 100)}
                        </p>
                      )}

                      {/* Meta */}
                      <p className="text-xs font-medium text-gray-500 mt-1.5">
                        ✍️ {b.author.nama} · 🕒 {formatTanggal(b.createdAt)}
                      </p>
                    </div>

                    {/* Tombol Edit */}
                    <Link href={`/admin/berita/${b.id}`}
                      className="shrink-0 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs font-medium text-gray-600">
                Halaman {page} dari {totalPages} · {total} artikel
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/berita?page=${page - 1}${q ? `&q=${q}` : ''}`}
                    className="px-3 py-1.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    ← Sebelumnya
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/admin/berita?page=${page + 1}${q ? `&q=${q}` : ''}`}
                    className="px-3 py-1.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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