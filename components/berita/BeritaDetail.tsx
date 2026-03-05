import Link from 'next/link'
import Image from 'next/image'
import { formatTanggal } from '@/lib/utils'

interface BeritaDetailProps {
  judul: string
  konten: string
  kategori: string
  fotoUrl: string | null
  publishedAt: Date | string | null
  createdAt: Date | string
  authorNama: string
  tags: string[]
}

export default function BeritaDetail({ judul, konten, kategori, fotoUrl, publishedAt, createdAt, authorNama, tags }: BeritaDetailProps) {
  return (
    <article>
      <div className="mb-4">
        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">{kategori}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">{judul}</h1>
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
        <span>{authorNama}</span>
        <span>·</span>
        <span>{formatTanggal(publishedAt ?? createdAt)}</span>
        {tags.length > 0 && (
          <>
            <span>·</span>
            <div className="flex gap-1 flex-wrap">
              {tags.map((tag) => (
                <Link key={tag} href={`/berita?q=${tag}`}
                  className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full hover:bg-blue-50 hover:text-blue-600">
                  {tag}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      {fotoUrl && <Image src={fotoUrl} alt={judul} width={768} height={288} className="w-full h-72 object-cover rounded-2xl mb-6" />}
      <div className="prose prose-sm max-w-none">
        {konten.split('\n').map((para, i) =>
          para.trim()
            ? <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>
            : <br key={i} />
        )}
      </div>
    </article>
  )
}