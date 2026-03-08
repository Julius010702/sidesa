import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { formatTanggal, getStatusColor, getStatusLabel } from '@/lib/utils'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

const kategoriIcon: Record<string, string> = {
  JALAN_RUSAK: '🛣️',
  LAMPU_MATI: '💡',
  SAMPAH: '🗑️',
  DRAINASE: '🌊',
  KEAMANAN: '🔒',
  SOSIAL: '🤝',
  LAINNYA: '📋',
}

async function getPengaduanList(status?: string, search?: string) {
  return prisma.pengaduan.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { judul: { contains: search, mode: 'insensitive' } },
              { lokasi: { contains: search, mode: 'insensitive' } },
              { user: { nama: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    orderBy: [{ prioritas: 'asc' }, { tanggalLapor: 'desc' }],
    include: {
      user: { select: { id: true, nama: true, nik: true } },
    },
  })
}

type PengaduanList = Awaited<ReturnType<typeof getPengaduanList>>
type PengaduanItem = PengaduanList[number]

const statusTabs = [
  { value: '', label: 'Semua' },
  { value: 'DITERIMA', label: 'Diterima' },
  { value: 'DICEK', label: 'Dicek' },
  { value: 'DIPROSES', label: 'Diproses' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'DITOLAK', label: 'Ditolak' },
]

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>
}

export default async function AdminPengaduanPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { status, q } = await searchParams
  const list = await getPengaduanList(status, q)

  const allPengaduan = await prisma.pengaduan.findMany({ select: { status: true } })
  const countByStatus = (s: string) => allPengaduan.filter((x: { status: string }) => x.status === s).length

  return (
    <div>
      <HeaderPage
        title="Manajemen Pengaduan"
        subtitle="Kelola dan tindaklanjuti semua pengaduan warga"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Pengaduan' }]}
      />

      {/* Search */}
      <form method="GET" className="mb-4">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari judul, lokasi, atau nama warga..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </form>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {statusTabs.map((tab) => {
          const isActive = (status ?? '') === tab.value
          const count = tab.value ? countByStatus(tab.value) : allPengaduan.length
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/pengaduan?status=${tab.value}${q ? `&q=${q}` : ''}` : `/admin/pengaduan${q ? `?q=${q}` : ''}`}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">
            {q ? `Tidak ada hasil untuk "${q}"` : 'Belum ada pengaduan masuk'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((p: PengaduanItem) => (
            <Link
              key={p.id}
              href={`/admin/pengaduan/${p.id}`}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className={`w-1 self-stretch rounded-full shrink-0 ${
                p.prioritas <= 1 ? 'bg-red-500' :
                p.prioritas === 2 ? 'bg-orange-400' :
                p.prioritas === 3 ? 'bg-yellow-400' :
                'bg-gray-200'
              }`} />
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-lg shrink-0 group-hover:bg-orange-100 transition-colors">
                {kategoriIcon[p.kategori] ?? '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 text-sm truncate">{p.judul}</p>
                  {p.prioritas <= 2 && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {p.user.nama} · {getStatusLabel(p.kategori)} · {p.lokasi}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatTanggal(p.tanggalLapor, 'dd MMM yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(p.status)}`}>
                  {getStatusLabel(p.status)}
                </span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400 text-right">
        {list.length} pengaduan · diurutkan berdasarkan prioritas
      </div>
    </div>
  )
}