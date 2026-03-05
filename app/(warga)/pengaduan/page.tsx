import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { formatTanggal, getStatusColor, getStatusLabel } from '@/lib/utils'

async function getPengaduanList(userId: string) {
  return prisma.pengaduan.findMany({
    where: { userId },
    orderBy: { tanggalLapor: 'desc' },
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

const kategoriIcon: Record<string, string> = {
  JALAN_RUSAK: '🛣️',
  LAMPU_MATI: '💡',
  SAMPAH: '🗑️',
  DRAINASE: '🌊',
  KEAMANAN: '🔒',
  SOSIAL: '🤝',
  LAINNYA: '📋',
}

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function PengaduanListPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { status } = await searchParams
  const allPengaduan = await getPengaduanList(session.userId)

  const filtered: PengaduanItem[] = status
    ? allPengaduan.filter((p: PengaduanItem) => p.status === status)
    : allPengaduan

  return (
    <div>
      <HeaderPage
        title="Pengaduan"
        subtitle="Laporkan masalah di lingkungan desa Anda"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Pengaduan' }]}
        action={
          <Link
            href="/pengaduan/buat"
            className="inline-flex items-center gap-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-sm shadow-orange-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Buat Pengaduan
          </Link>
        }
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {statusTabs.map((tab) => {
          const isActive = (status ?? '') === tab.value
          const count = tab.value
            ? allPengaduan.filter((p: PengaduanItem) => p.status === tab.value).length
            : allPengaduan.length

          return (
            <Link
              key={tab.value}
              href={tab.value ? `/pengaduan?status=${tab.value}` : '/pengaduan'}
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">📢</div>
          <p className="text-gray-500 font-medium">
            {status
              ? `Tidak ada pengaduan dengan status "${getStatusLabel(status)}"`
              : 'Belum ada pengaduan'}
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            Laporkan masalah di sekitar Anda agar dapat segera ditindaklanjuti
          </p>
          <Link
            href="/pengaduan/buat"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            Buat Pengaduan Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p: PengaduanItem) => (
            <Link
              key={p.id}
              href={`/pengaduan/${p.id}`}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:bg-orange-100 transition-colors">
                {kategoriIcon[p.kategori] ?? '📋'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{p.judul}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {getStatusLabel(p.kategori)} · {p.lokasi}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Dilaporkan {formatTanggal(p.tanggalLapor, 'dd MMM yyyy')}
                  {p.tanggalSelesai && (
                    <> · Selesai {formatTanggal(p.tanggalSelesai, 'dd MMM yyyy')}</>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {p.prioritas <= 2 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Urgent
                  </span>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(p.status)}`}>
                  {getStatusLabel(p.status)}
                </span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}