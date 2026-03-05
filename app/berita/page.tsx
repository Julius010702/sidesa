import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { formatTanggal } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{ q?: string; kategori?: string }>
}

export default async function BeritaPublikPage({ searchParams }: PageProps) {
  const { q = '', kategori = '' } = await searchParams

  const where: Record<string, unknown> = { isPublished: true }
  if (q) where.OR = [{ judul: { contains: q, mode: 'insensitive' } }]
  if (kategori) where.kategori = { equals: kategori, mode: 'insensitive' }

  const [beritaList, pinned, kategoriList, profil] = await Promise.all([
    prisma.berita.findMany({
      where: { ...where, isPinned: false },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: { author: { select: { nama: true } } },
    }),
    prisma.berita.findMany({
      where: { isPublished: true, isPinned: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: { author: { select: { nama: true } } },
    }),
    prisma.berita.findMany({ where: { isPublished: true }, distinct: ['kategori'], select: { kategori: true } }),
    prisma.profilDesa.findFirst(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-sm">
            🏡 {profil?.namaDesaa ?? 'Desa'}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/berita" className="text-blue-600 font-semibold">Berita</Link>
            <Link href="/login" className="text-gray-500 hover:text-gray-800">Masuk</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Berita & Pengumuman</h1>
          <p className="text-gray-500 mt-1">Informasi terbaru dari {profil?.namaDesaa ?? 'desa kami'}</p>
        </div>

        {/* Search & filter */}
        <form method="GET" className="mb-6 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input name="q" defaultValue={q} placeholder="Cari berita..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          <select name="kategori" defaultValue={kategori}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Kategori</option>
            {kategoriList.map((k) => <option key={k.kategori} value={k.kategori}>{k.kategori}</option>)}
          </select>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Cari</button>
        </form>

        {/* Pinned */}
        {pinned.length > 0 && !q && !kategori && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">📌 Pengumuman Penting</h2>
            <div className="space-y-3">
              {pinned.map((b) => (
                <Link key={b.id} href={`/berita/${b.slug}`}
                  className="flex items-start gap-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 hover:bg-yellow-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full">{b.kategori}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{b.judul}</h3>
                    {b.excerpt && <p className="text-xs text-gray-500 mt-0.5">{b.excerpt}</p>}
                    <p className="text-xs text-gray-400 mt-1">{b.author.nama} · {formatTanggal(b.publishedAt ?? b.createdAt)}</p>
                  </div>
                  {b.fotoUrl && (
                    <Image
                      src={b.fotoUrl}
                      alt={b.judul}
                      width={80}
                      height={56}
                      className="w-20 h-14 object-cover rounded-xl shrink-0"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Berita list */}
        {beritaList.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📰</div>
            <p className="text-gray-500">Belum ada berita</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {beritaList.map((b) => (
              <Link key={b.id} href={`/berita/${b.slug}`}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm hover:border-blue-200 transition-all group">
                {b.fotoUrl ? (
                  <Image
                    src={b.fotoUrl}
                    alt={b.judul}
                    width={600}
                    height={176}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-5xl">📰</div>
                )}
                <div className="p-4">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{b.kategori}</span>
                  <h3 className="font-semibold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">{b.judul}</h3>
                  {b.excerpt && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.excerpt}</p>}
                  <p className="text-xs text-gray-400 mt-2">{b.author.nama} · {formatTanggal(b.publishedAt ?? b.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}