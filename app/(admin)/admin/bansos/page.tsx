import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { getStatusColor, getStatusLabel } from '@/lib/utils'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

interface BansosItem {
  id: string
  jenisBansos: string
  tahun: number
  nominal: number | null
  status: string
  penduduk: {
    id: string
    nama: string
    nik: string
    alamat: string
  }
  _count: {
    penyaluran: number
  }
}

async function getBansosList(search: string, page: number, status: string) {
  const limit = 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { penduduk: { nama: { contains: search, mode: 'insensitive' } } },
      { penduduk: { nik: { contains: search } } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.bansos.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        penduduk: { select: { id: true, nama: true, nik: true, alamat: true } },
        _count: { select: { penyaluran: true } },
      },
    }),
    prisma.bansos.count({ where }),
  ])

  return { data, total, totalPages: Math.ceil(total / limit) }
}

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>
}

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'AKTIF', label: 'Aktif' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'TIDAK_AKTIF', label: 'Tidak Aktif' },
]

export default async function AdminBansosPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { q = '', page: pageStr = '1', status = '' } = await searchParams
  const page = Math.max(1, parseInt(pageStr))
  const { data, total, totalPages } = await getBansosList(q, page, status)

  const stats = await prisma.bansos.groupBy({
    by: ['status'],
    _count: true,
  })
  const statMap = Object.fromEntries(
    stats.map((s: { status: string; _count: number }) => [s.status, s._count])
  )

  return (
    <div>
      <HeaderPage
        title="Bantuan Sosial"
        subtitle={`${total.toLocaleString('id-ID')} data bansos`}
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Bansos' }]}
        action={
          <Link
            href="/admin/bansos/tambah"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Penerima
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Aktif', key: 'AKTIF', color: 'bg-green-50 text-green-700' },
          { label: 'Pending', key: 'PENDING', color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Tidak Aktif', key: 'TIDAK_AKTIF', color: 'bg-gray-50 text-gray-600' },
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
          <input name="q" defaultValue={q} placeholder="Cari nama / NIK..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select name="status" defaultValue={status} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Cari</button>
        <Link href="/admin/bansos/penyaluran" className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
          Catat Penyaluran
        </Link>
      </form>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">Belum ada data bansos</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Penerima</div>
              <div className="col-span-2">Jenis</div>
              <div className="col-span-2">Tahun</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Penyaluran</div>
            </div>
            <div className="divide-y divide-gray-50">
              {(data as BansosItem[]).map((b) => (
                <div key={b.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors items-center">
                  <div className="md:col-span-4">
                    <p className="text-sm font-semibold text-gray-800">{b.penduduk.nama}</p>
                    <p className="text-xs text-gray-400 font-mono">{b.penduduk.nik}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                      {getStatusLabel(b.jenisBansos)}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-700">{b.tahun}</p>
                    {b.nominal && (
                      <p className="text-xs text-gray-400">Rp {b.nominal.toLocaleString('id-ID')}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(b.status)}`}>
                      {getStatusLabel(b.status)}
                    </span>
                  </div>
                  <div className="md:col-span-2 text-right">
                    <span className="text-sm font-semibold text-gray-700">{b._count.penyaluran}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">Halaman {page} dari {totalPages}</p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/bansos?page=${page - 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
                    className="px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">← Sebelumnya</Link>
                )}
                {page < totalPages && (
                  <Link href={`/admin/bansos?page=${page + 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
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