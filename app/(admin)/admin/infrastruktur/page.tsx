import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import Image from 'next/image'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

const kondisiColor: Record<string, string> = {
  BAIK: 'bg-green-100 text-green-700',
  SEDANG: 'bg-yellow-100 text-yellow-700',
  RUSAK: 'bg-red-100 text-red-700',
  RUSAK_BERAT: 'bg-red-200 text-red-800',
}

interface PageProps {
  searchParams: Promise<{ q?: string; kategori?: string }>
}

export default async function AdminInfrastrukturPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { q = '', kategori = '' } = await searchParams

  const where: Record<string, unknown> = {}
  if (q) where.OR = [
    { nama: { contains: q, mode: 'insensitive' } },
    { lokasi: { contains: q, mode: 'insensitive' } },
  ]
  if (kategori) where.kategori = { equals: kategori, mode: 'insensitive' }

  const [data, stats] = await Promise.all([
    prisma.infrastruktur.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.infrastruktur.groupBy({ by: ['kondisi'], _count: true }),
  ])

  const statMap = Object.fromEntries(stats.map((s) => [s.kondisi, s._count]))
  const kategoriList = await prisma.infrastruktur.findMany({ distinct: ['kategori'], select: { kategori: true } })

  return (
    <div>
      <HeaderPage
        title="Infrastruktur Desa"
        subtitle={`${data.length} aset terdaftar`}
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Infrastruktur' }]}
        action={
          <Link href="/admin/infrastruktur/tambah"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Aset
          </Link>
        }
      />

      {/* Stats kondisi */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { key: 'BAIK', label: 'Baik', color: 'bg-green-50 text-green-700' },
          { key: 'SEDANG', label: 'Sedang', color: 'bg-yellow-50 text-yellow-700' },
          { key: 'RUSAK', label: 'Rusak', color: 'bg-red-50 text-red-700' },
          { key: 'RUSAK_BERAT', label: 'Rusak Berat', color: 'bg-red-100 text-red-800' },
        ].map((s) => (
          <div key={s.key} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{statMap[s.key] ?? 0}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <form method="GET" className="mb-5 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input name="q" defaultValue={q} placeholder="Cari nama atau lokasi..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select name="kategori" defaultValue={kategori}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Semua Kategori</option>
          {kategoriList.map((k) => <option key={k.kategori} value={k.kategori}>{k.kategori}</option>)}
        </select>
        <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Cari</button>
      </form>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">🏗️</div>
          <p className="text-gray-500 font-medium">Belum ada data infrastruktur</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <Link key={item.id} href={`/admin/infrastruktur/${item.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all group">
              {item.foto ? (
                <Image src={item.foto} alt={item.nama} width={400} height={128} className="w-full h-32 object-cover rounded-xl mb-3" />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-4xl">🏗️</div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600">{item.nama}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.kategori} · {item.lokasi}</p>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${kondisiColor[item.kondisi] ?? 'bg-gray-100 text-gray-600'}`}>
                  {item.kondisi.replace(/_/g, ' ')}
                </span>
              </div>
              {item.catatan && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.catatan}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}