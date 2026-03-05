import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { formatTanggal, getStatusColor, getStatusLabel } from '@/lib/utils'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

async function getSuratList(status?: string, search?: string) {
  return prisma.surat.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { user: { nama: { contains: search, mode: 'insensitive' } } },
              { user: { nik: { contains: search } } },
              { keperluan: { contains: search, mode: 'insensitive' } },
              { nomorSurat: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, nama: true, nik: true, noHp: true } },
    },
  })
}

type SuratList = Awaited<ReturnType<typeof getSuratList>>
type SuratItem = SuratList[number]

const statusTabs = [
  { value: '', label: 'Semua' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DIPROSES', label: 'Diproses' },
  { value: 'DISETUJUI', label: 'Disetujui' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'DITOLAK', label: 'Ditolak' },
]

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>
}

export default async function AdminSuratPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { status, q } = await searchParams
  const suratList = await getSuratList(status, q)

  // Hitung per status untuk badge
  const allSurat = await prisma.surat.findMany({ select: { status: true } })
  // ✅ FIX: Added explicit type annotation to fix TS7006 implicit any
  const countByStatus = (s: string) => allSurat.filter((x: { status: string }) => x.status === s).length

  return (
    <div>
      <HeaderPage
        title="Manajemen Surat"
        subtitle="Kelola semua pengajuan surat dari warga"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Surat' }]}
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
            placeholder="Cari nama, NIK, keperluan..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
      </form>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {statusTabs.map((tab) => {
          const isActive = (status ?? '') === tab.value
          const count = tab.value ? countByStatus(tab.value) : allSurat.length
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/surat?status=${tab.value}${q ? `&q=${q}` : ''}` : `/admin/surat${q ? `?q=${q}` : ''}`}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'
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

      {/* Tabel / List */}
      {suratList.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">📭</div>
          {/* ✅ FIX: Replaced raw " with &ldquo; and &rdquo; to fix react/no-unescaped-entities */}
          <p className="text-gray-500 font-medium">
            {q ? <>Tidak ada hasil untuk &ldquo;{q}&rdquo;</> : 'Belum ada surat masuk'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {/* Header tabel */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Warga</div>
            <div className="col-span-3">Jenis Surat</div>
            <div className="col-span-2">Tanggal</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>

          <div className="divide-y divide-gray-50">
            {suratList.map((s: SuratItem) => (
              <div key={s.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors items-center">
                {/* Warga */}
                <div className="sm:col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-xs">
                      {s.user.nama.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.user.nama}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.user.nik}</p>
                  </div>
                </div>

                {/* Jenis */}
                <div className="sm:col-span-3">
                  <p className="text-sm text-gray-700">{getStatusLabel(s.jenisSurat)}</p>
                  <p className="text-xs text-gray-400 truncate">{s.keperluan}</p>
                </div>

                {/* Tanggal */}
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-600">{formatTanggal(s.tanggalDiajukan, 'dd MMM yyyy')}</p>
                  {s.nomorSurat && (
                    <p className="text-xs text-gray-400 font-mono truncate">{s.nomorSurat}</p>
                  )}
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(s.status)}`}>
                    {getStatusLabel(s.status)}
                  </span>
                </div>

                {/* Aksi */}
                <div className="sm:col-span-1 flex justify-end">
                  <Link
                    href={`/admin/surat/${s.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Proses
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Footer count */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan <span className="font-semibold text-gray-600">{suratList.length}</span> surat
              {status && <> dengan status <span className="font-semibold">{getStatusLabel(status)}</span></>}
              {q && <> hasil pencarian &ldquo;<span className="font-semibold">{q}</span>&rdquo;</>}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}