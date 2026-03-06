// app/(admin)/admin/infrastruktur/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

const kondisiConfig: Record<string, { bg: string; text: string; border: string }> = {
  BAIK:       { bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-200' },
  SEDANG:     { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  RUSAK:      { bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-red-200' },
  RUSAK_BERAT:{ bg: 'bg-red-100',   text: 'text-red-900',    border: 'border-red-300' },
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

  const [data, stats, kategoriList] = await Promise.all([
    prisma.infrastruktur.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.infrastruktur.groupBy({ by: ['kondisi'], _count: true }),
    prisma.infrastruktur.findMany({ distinct: ['kategori'], select: { kategori: true } }),
  ])

  const statMap = Object.fromEntries(stats.map((s) => [s.kondisi, s._count]))

  return (
    <div>
      <HeaderPage
        title="Infrastruktur Desa"
        subtitle={`${data.length} aset terdaftar`}
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Infrastruktur' }]}
        action={
          <Link href="/admin/infrastruktur/tambah"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
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
          { key: 'BAIK',       label: 'Baik',       bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  sub: 'text-green-600' },
          { key: 'SEDANG',     label: 'Sedang',     bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', sub: 'text-yellow-600' },
          { key: 'RUSAK',      label: 'Rusak',      bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    sub: 'text-red-600' },
          { key: 'RUSAK_BERAT',label: 'Rusak Berat',bg: 'bg-red-100',   border: 'border-red-300',    text: 'text-red-900',    sub: 'text-red-700' },
        ].map((s) => (
          <div key={s.key} className={`rounded-2xl p-4 border ${s.bg} ${s.border}`}>
            <p className={`text-2xl font-bold ${s.text}`}>{statMap[s.key] ?? 0}</p>
            <p className={`text-xs font-semibold mt-0.5 ${s.sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <form method="GET" className="mb-5 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input name="q" defaultValue={q} placeholder="Cari nama atau lokasi..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
        </div>
        <select name="kategori" defaultValue={kategori}
          className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
          <option value="">Semua Kategori</option>
          {kategoriList.map((k) => <option key={k.kategori} value={k.kategori}>{k.kategori}</option>)}
        </select>
        <button type="submit"
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm">
          Cari
        </button>
      </form>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-16 text-center shadow-sm">
          <div className="text-5xl mb-3">🏗️</div>
          <p className="text-gray-800 font-semibold text-base">Belum ada data infrastruktur</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Tambahkan aset infrastruktur desa</p>
          <Link href="/admin/infrastruktur/tambah"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
            Tambah Aset Pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => {
            const cfg = kondisiConfig[item.kondisi] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
            return (
              <Link key={item.id} href={`/admin/infrastruktur/${item.id}`}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group">
                {item.foto ? (
                  <Image src={item.foto} alt={item.nama} width={400} height={128}
                    className="w-full h-40 object-cover" />
                ) : (
<div className="w-full h-40 bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">                    <span className="text-5xl">🏗️</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-blue-700 transition-colors truncate">
                      {item.nama}
                    </h3>
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {item.kondisi.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{item.kategori}</span>
                    <span className="text-gray-400">·</span>
                    <span className="truncate">{item.lokasi}</span>
                  </div>
                  {item.catatan && (
                    <p className="text-xs font-medium text-gray-500 mt-2 line-clamp-2">{item.catatan}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}