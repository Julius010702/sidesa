import BeritaCard from './BeritaCard'

interface Berita {
  id: string
  judul: string
  slug: string
  excerpt: string | null
  fotoUrl: string | null
  kategori: string
  publishedAt: Date | string | null
  createdAt: Date | string
  author?: { nama: string }
}

interface BeritaListProps {
  items: Berita[]
  cols?: 2 | 3
}

export default function BeritaList({ items, cols = 2 }: BeritaListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📰</div>
        <p className="text-gray-500">Belum ada berita</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 ${cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-5`}>
      {items.map((b) => (
        <BeritaCard
          key={b.id}
          id={b.id}
          judul={b.judul}
          slug={b.slug}
          excerpt={b.excerpt}
          fotoUrl={b.fotoUrl}
          kategori={b.kategori}
          publishedAt={b.publishedAt}
          createdAt={b.createdAt}
          authorNama={b.author?.nama}
        />
      ))}
    </div>
  )
}
