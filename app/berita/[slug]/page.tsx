import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { formatTanggal } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BeritaDetailPage({ params }: PageProps) {
  const { slug } = await params

  const berita = await prisma.berita.findUnique({
    where: { slug, isPublished: true },
    include: { author: { select: { nama: true } } },
  })
  if (!berita) notFound()

  const profil = await prisma.profilDesa.findFirst()

  const related = await prisma.berita.findMany({
    where: { isPublished: true, kategori: berita.kategori, id: { not: berita.id } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { id: true, judul: true, slug: true, fotoUrl: true, publishedAt: true, createdAt: true },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-sm">🏡 {profil?.namaDesaa ?? 'Desa'}</Link>
          <Link href="/berita" className="text-sm text-blue-600 font-semibold">← Semua Berita</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Article */}
        <article>
          <div className="mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">{berita.kategori}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">{berita.judul}</h1>

          <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
            <span>{berita.author.nama}</span>
            <span>·</span>
            <span>{formatTanggal(berita.publishedAt ?? berita.createdAt)}</span>
            {berita.tags.length > 0 && (
              <>
                <span>·</span>
                <div className="flex gap-1">
                  {berita.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {berita.fotoUrl && (
            <Image
              src={berita.fotoUrl}
              alt={berita.judul}
              width={768}
              height={288}
              className="w-full h-72 object-cover rounded-2xl mb-6"
            />
          )}

          <div className="prose prose-sm max-w-none">
            {berita.konten.split('\n').map((para, i) => (
              para.trim() ? <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p> : <br key={i} />
            ))}
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Berita Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/berita/${r.slug}`}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm hover:border-blue-200 transition-all group">
                  {r.fotoUrl ? (
                    <Image
                      src={r.fotoUrl}
                      alt={r.judul}
                      width={300}
                      height={112}
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-3xl">📰</div>
                  )}
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 line-clamp-2">{r.judul}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTanggal(r.publishedAt ?? r.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}