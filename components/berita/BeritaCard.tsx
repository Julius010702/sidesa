import Link from 'next/link'
import Image from 'next/image'
import { formatTanggal, truncate } from '@/lib/utils'

interface BeritaCardProps {
  id: string
  judul: string
  slug: string
  excerpt: string | null
  fotoUrl: string | null
  kategori: string
  publishedAt: string | Date | null
  createdAt: string | Date
  authorNama?: string
}

export default function BeritaCard({ judul, slug, excerpt, fotoUrl, kategori, publishedAt, createdAt, authorNama }: BeritaCardProps) {
  return (
    <Link href={`/berita/${slug}`}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm hover:border-blue-200 transition-all group block">
      {fotoUrl ? (
        <Image
          src={fotoUrl}
          alt={judul}
          width={600}
          height={176}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-5xl">📰</div>
      )}
      <div className="p-4">
        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{kategori}</span>
        <h3 className="font-semibold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors leading-snug">{judul}</h3>
        {excerpt && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{truncate(excerpt, 100)}</p>}
        <p className="text-xs text-gray-400 mt-2">
          {authorNama && <span>{authorNama} · </span>}
          {formatTanggal(publishedAt ?? createdAt)}
        </p>
      </div>
    </Link>
  )
}