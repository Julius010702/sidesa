import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import DashboardAdminStats from '@/components/admin/DashboardAdminStats'
import { formatTanggal, formatTanggalJam, getStatusColor, getStatusLabel } from '@/lib/utils'

async function getAdminStats() {
  const [
    totalPenduduk,
    totalSurat,
    suratPending,
    suratDiproses,
    totalPengaduan,
    pengaduanAktif,
    totalBansos,
    totalBerita,
    suratTerbaru,
    pengaduanTerbaru,
  ] = await Promise.all([
    prisma.penduduk.count({ where: { statusHidup: true } }),
    prisma.surat.count(),
    prisma.surat.count({ where: { status: 'PENDING' } }),
    prisma.surat.count({ where: { status: 'DIPROSES' } }),
    prisma.pengaduan.count(),
    prisma.pengaduan.count({
      where: { status: { in: ['DITERIMA', 'DICEK', 'DIPROSES'] } },
    }),
    prisma.bansos.count({ where: { status: 'AKTIF' } }),
    prisma.berita.count({ where: { isPublished: true } }),
    prisma.surat.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { nama: true, nik: true } },
      },
    }),
    prisma.pengaduan.findMany({
      orderBy: { tanggalLapor: 'desc' },
      take: 5,
      include: {
        user: { select: { nama: true } },
      },
    }),
  ])

  return {
    totalPenduduk,
    totalSurat,
    suratPending,
    suratDiproses,
    totalPengaduan,
    pengaduanAktif,
    totalBansos,
    totalBerita,
    suratTerbaru,
    pengaduanTerbaru,
  }
}

type AdminStats = Awaited<ReturnType<typeof getAdminStats>>
type SuratTerbaru = AdminStats['suratTerbaru'][number]
type PengaduanTerbaru = AdminStats['pengaduanTerbaru'][number]

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const stats = await getAdminStats()

  const statCards = [
    {
      label: 'Total Penduduk',
      value: stats.totalPenduduk.toLocaleString('id-ID'),
      color: 'blue' as const,
      href: '/admin/penduduk',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Surat Pending',
      value: stats.suratPending,
      subLabel: `${stats.suratDiproses} diproses`,
      color: 'amber' as const,
      href: '/admin/surat',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: stats.suratPending > 0
        ? { value: stats.suratPending, label: 'perlu aksi', positive: false }
        : undefined,
    },
    {
      label: 'Pengaduan Aktif',
      value: stats.pengaduanAktif,
      subLabel: `dari ${stats.totalPengaduan} total`,
      color: 'red' as const,
      href: '/admin/pengaduan',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      trend: stats.pengaduanAktif > 0
        ? { value: stats.pengaduanAktif, label: 'belum selesai', positive: false }
        : undefined,
    },
    {
      label: 'Bansos Aktif',
      value: stats.totalBansos,
      color: 'green' as const,
      href: '/admin/bansos',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Surat',
      value: stats.totalSurat,
      color: 'purple' as const,
      href: '/admin/surat',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Berita Tayang',
      value: stats.totalBerita,
      color: 'teal' as const,
      href: '/admin/berita',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
  ]

  return (
    <div>
      <HeaderPage
        title={`Dashboard Admin`}
        subtitle={`Selamat datang, ${session.nama} · ${formatTanggal(new Date())}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/surat"
              className="inline-flex items-center gap-1.5 bg-amber-500 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-amber-600 transition-colors"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {stats.suratPending} Surat Pending
            </Link>
            <Link
              href="/admin/pengaduan"
              className="inline-flex items-center gap-1.5 bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {stats.pengaduanAktif} Pengaduan Aktif
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <DashboardAdminStats stats={statCards} />

      {/* Recent activity */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Surat terbaru */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Surat Masuk Terbaru</h2>
            <Link href="/admin/surat" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Kelola semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.suratTerbaru.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                Belum ada surat masuk
              </div>
            ) : (
              stats.suratTerbaru.map((s: SuratTerbaru) => (
                <Link
                  key={s.id}
                  href={`/admin/surat/${s.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {s.user.nama}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getStatusLabel(s.jenisSurat)} · {formatTanggal(s.tanggalDiajukan, 'dd MMM yyyy')}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${getStatusColor(s.status)}`}>
                    {getStatusLabel(s.status)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Pengaduan terbaru */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Pengaduan Terbaru</h2>
            <Link href="/admin/pengaduan" className="text-xs text-red-600 hover:text-red-700 font-medium">
              Kelola semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.pengaduanTerbaru.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                Belum ada pengaduan masuk
              </div>
            ) : (
              stats.pengaduanTerbaru.map((p: PengaduanTerbaru) => (
                <Link
                  key={p.id}
                  href={`/admin/pengaduan/${p.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.judul}</p>
                    <p className="text-xs text-gray-400">
                      {p.user.nama} · {formatTanggalJam(p.tanggalLapor)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.prioritas <= 2 && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">!</span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(p.status)}`}>
                      {getStatusLabel(p.status)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/penduduk/tambah', label: 'Tambah Penduduk', icon: '👤', color: 'bg-blue-500' },
            { href: '/admin/berita/tulis', label: 'Tulis Berita', icon: '✏️', color: 'bg-teal-500' },
            { href: '/admin/bansos/tambah', label: 'Tambah Bansos', icon: '💰', color: 'bg-green-500' },
            { href: '/admin/pengaturan', label: 'Pengaturan Desa', icon: '⚙️', color: 'bg-slate-500' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium text-gray-600 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}