import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import DashboardStats from '@/components/warga/DashboardStats'
import { formatTanggal, getStatusColor, getStatusLabel } from '@/lib/utils'

async function getWargaData(userId: string) {
  const [suratList, pengaduanList, bansosList] = await Promise.all([
    prisma.surat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.pengaduan.findMany({
      where: { userId },
      orderBy: { tanggalLapor: 'desc' },
      take: 3,
    }),
    prisma.bansos.findMany({
      where: {
        penduduk: { userId },
        status: 'AKTIF',
      },
      take: 5,
    }),
  ])

  return { suratList, pengaduanList, bansosList }
}

type WargaData = Awaited<ReturnType<typeof getWargaData>>
type SuratItem = WargaData['suratList'][number]
type PengaduanItem = WargaData['pengaduanList'][number]

export default async function DashboardWargaPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { suratList, pengaduanList, bansosList } = await getWargaData(session.userId)

  const suratPending = suratList.filter((s: SuratItem) =>
    ['PENDING', 'DIPROSES'].includes(s.status)
  ).length
  const pengaduanAktif = pengaduanList.filter((p: PengaduanItem) =>
    ['DITERIMA', 'DICEK', 'DIPROSES'].includes(p.status)
  ).length

  const stats = [
    {
      label: 'Total Surat',
      value: suratList.length,
      color: 'blue' as const,
      href: '/surat',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      trend: suratPending > 0 ? { label: `${suratPending} sedang diproses` } : { label: 'Semua selesai' },
    },
    {
      label: 'Surat Proses',
      value: suratPending,
      color: 'amber' as const,
      href: '/surat',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: { label: 'Menunggu admin' },
    },
    {
      label: 'Pengaduan',
      value: pengaduanList.length,
      color: 'red' as const,
      href: '/pengaduan',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      trend: pengaduanAktif > 0 ? { label: `${pengaduanAktif} aktif` } : { label: 'Tidak ada aktif' },
    },
    {
      label: 'Bansos Aktif',
      value: bansosList.length,
      color: 'green' as const,
      href: '/bansos',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      trend: { label: bansosList.length > 0 ? 'Penerima aktif' : 'Tidak terdaftar' },
    },
  ]

  return (
    <div>
      <HeaderPage
        title={`Selamat datang, ${session.nama.split(' ')[0]} 👋`}
        subtitle={`${formatTanggal(new Date())} · Portal Layanan Warga`}
        action={
          <Link
            href="/surat/ajukan"
            className="inline-flex items-center gap-2 bg-linear-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm shadow-green-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajukan Surat
          </Link>
        }
      />

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Layanan Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/surat/ajukan', label: 'Ajukan Surat', color: 'bg-blue-500', icon: '📄' },
            { href: '/pengaduan/buat', label: 'Buat Pengaduan', color: 'bg-orange-500', icon: '📢' },
            { href: '/bansos', label: 'Cek Bansos', color: 'bg-green-500', icon: '💰' },
            { href: '/chat', label: 'Hubungi Desa', color: 'bg-teal-500', icon: '💬' },
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

      {/* Recent Surat & Pengaduan */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Surat */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Pengajuan Surat Terbaru</h2>
            <Link href="/surat" className="text-xs text-green-600 hover:text-green-700 font-medium">
              Lihat semua →
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {suratList.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm text-gray-400">Belum ada pengajuan surat</p>
                <Link href="/surat/ajukan" className="text-xs text-green-600 hover:underline mt-1 inline-block">
                  Ajukan sekarang
                </Link>
              </div>
            ) : (
              suratList.map((surat: SuratItem) => (
                <Link key={surat.id} href={`/surat/${surat.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {getStatusLabel(surat.jenisSurat)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTanggal(surat.tanggalDiajukan, 'dd MMM yyyy')}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(surat.status)}`}>
                    {getStatusLabel(surat.status)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Pengaduan */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Pengaduan Terbaru</h2>
            <Link href="/pengaduan" className="text-xs text-green-600 hover:text-green-700 font-medium">
              Lihat semua →
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {pengaduanList.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="text-3xl mb-2">📢</div>
                <p className="text-sm text-gray-400">Belum ada pengaduan</p>
                <Link href="/pengaduan/buat" className="text-xs text-green-600 hover:underline mt-1 inline-block">
                  Buat pengaduan
                </Link>
              </div>
            ) : (
              pengaduanList.map((p: PengaduanItem) => (
                <Link key={p.id} href={`/pengaduan/${p.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.judul}</p>
                    <p className="text-xs text-gray-400">
                      {getStatusLabel(p.kategori)} · {formatTanggal(p.tanggalLapor, 'dd MMM yyyy')}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(p.status)}`}>
                    {getStatusLabel(p.status)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-4 bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Butuh bantuan?</p>
          <p className="text-green-100 text-xs mt-0.5">
            Tim desa siap membantu Anda melalui fitur chat atau kunjungi kantor desa pada jam kerja.
          </p>
        </div>
        <Link
          href="/chat"
          className="shrink-0 bg-white text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-50 transition-colors"
        >
          Chat
        </Link>
      </div>
    </div>
  )
}