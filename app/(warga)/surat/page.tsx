import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { formatTanggal, getStatusColor, getStatusLabel } from '@/lib/utils'

async function getSuratList(userId: string) {
  return prisma.surat.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

type SuratList = Awaited<ReturnType<typeof getSuratList>>
type SuratItem = SuratList[number]

const statusTabs = [
  { value: '', label: 'Semua' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'DIPROSES', label: 'Diproses' },
  { value: 'DISETUJUI', label: 'Disetujui' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'DITOLAK', label: 'Ditolak' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function SuratListPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { status } = await searchParams
  const allSurat = await getSuratList(session.userId)

  const filtered: SuratItem[] = status
    ? allSurat.filter((s: SuratItem) => s.status === status)
    : allSurat

  return (
    <div>
      <HeaderPage
        title="Pengajuan Surat"
        subtitle="Riwayat dan status semua pengajuan surat Anda"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Surat' }]}
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

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {statusTabs.map((tab) => {
          const isActive = (status ?? '') === tab.value
          const count = tab.value
            ? allSurat.filter((s: SuratItem) => s.status === tab.value).length
            : allSurat.length

          return (
            <Link
              key={tab.value}
              href={tab.value ? `/surat?status=${tab.value}` : '/surat'}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700'
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
          <div className="text-5xl mb-3">📄</div>
          <p className="text-gray-500 font-medium">
            {status ? `Tidak ada surat dengan status "${getStatusLabel(status)}"` : 'Belum ada pengajuan surat'}
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            Ajukan surat keterangan yang Anda butuhkan
          </p>
          <Link
            href="/surat/ajukan"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Ajukan Surat Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((surat: SuratItem) => (
            <Link
              key={surat.id}
              href={`/surat/${surat.id}`}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              {/* Icon */}
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800 text-sm">
                    {getStatusLabel(surat.jenisSurat)}
                  </p>
                  {surat.nomorSurat && (
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-lg">
                      {surat.nomorSurat}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{surat.keperluan}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Diajukan {formatTanggal(surat.tanggalDiajukan, 'dd MMM yyyy')}
                  {surat.tanggalSelesai && (
                    <> · Selesai {formatTanggal(surat.tanggalSelesai, 'dd MMM yyyy')}</>
                  )}
                </p>
              </div>

              {/* Status + arrow */}
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(surat.status)}`}>
                  {getStatusLabel(surat.status)}
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