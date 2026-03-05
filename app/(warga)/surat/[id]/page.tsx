import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { formatTanggal, formatTanggalJam, getStatusColor, getStatusLabel } from '@/lib/utils'

async function getSurat(id: string, userId: string) {
  const surat = await prisma.surat.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, nama: true, nik: true, noHp: true, email: true } },
    },
  })
  if (!surat) return null
  if (surat.userId !== userId) return null
  return surat
}

type SuratDetail = NonNullable<Awaited<ReturnType<typeof getSurat>>>

interface TimelineStep {
  label: string
  description: string
  date?: Date | null
  done: boolean
  current: boolean
}

function buildTimeline(surat: SuratDetail): TimelineStep[] {
  const statusOrder = ['PENDING', 'DIPROSES', 'DISETUJUI', 'SELESAI']
  const isDitolak = surat.status === 'DITOLAK'

  if (isDitolak) {
    return [
      { label: 'Diajukan', description: 'Pengajuan surat diterima sistem', date: surat.tanggalDiajukan, done: true, current: false },
      { label: 'Ditolak', description: surat.catatanAdmin ?? 'Surat tidak dapat diproses', date: surat.updatedAt, done: true, current: true },
    ]
  }

  const currentIdx = statusOrder.indexOf(surat.status)

  return [
    {
      label: 'Diajukan',
      description: 'Pengajuan surat diterima',
      date: surat.tanggalDiajukan,
      done: true,
      current: surat.status === 'PENDING',
    },
    {
      label: 'Diproses',
      description: 'Perangkat desa memproses surat',
      date: surat.tanggalDiproses,
      done: currentIdx >= 1,
      current: surat.status === 'DIPROSES',
    },
    {
      label: 'Disetujui',
      description: 'Surat ditandatangani dan diberi nomor',
      date: surat.status === 'DISETUJUI' || surat.status === 'SELESAI' ? surat.tanggalDiproses : null,
      done: currentIdx >= 2,
      current: surat.status === 'DISETUJUI',
    },
    {
      label: 'Selesai',
      description: 'Surat siap diambil di kantor desa',
      date: surat.tanggalSelesai,
      done: surat.status === 'SELESAI',
      current: surat.status === 'SELESAI',
    },
  ]
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ baru?: string }>
}

export default async function DetailSuratPage({ params, searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const { baru } = await searchParams

  const surat = await getSurat(id, session.userId)
  if (!surat) notFound()

  const timeline = buildTimeline(surat)
  const isDitolak = surat.status === 'DITOLAK'
  const isSelesai = surat.status === 'SELESAI'

  return (
    <div>
      <HeaderPage
        title="Detail Surat"
        subtitle={getStatusLabel(surat.jenisSurat)}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Surat', href: '/surat' },
          { label: 'Detail' },
        ]}
      />

      {/* Sukses baru diajukan */}
      {baru === '1' && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-5">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Pengajuan Berhasil Dikirim!</p>
            <p className="text-xs text-green-600 mt-0.5">
              Surat Anda sedang antri untuk diproses. Estimasi 1–3 hari kerja.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Info surat */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-gray-900">{getStatusLabel(surat.jenisSurat)}</h2>
                {surat.nomorSurat && (
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{surat.nomorSurat}</p>
                )}
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${getStatusColor(surat.status)}`}>
                {getStatusLabel(surat.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-28 shrink-0">Keperluan</span>
                <span className="text-xs text-gray-700 font-medium flex-1">{surat.keperluan}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-28 shrink-0">Tanggal Ajuan</span>
                <span className="text-xs text-gray-700">{formatTanggalJam(surat.tanggalDiajukan)}</span>
              </div>
              {surat.tanggalDiproses && (
                <div className="flex gap-3">
                  <span className="text-xs text-gray-400 w-28 shrink-0">Diproses</span>
                  <span className="text-xs text-gray-700">{formatTanggal(surat.tanggalDiproses)}</span>
                </div>
              )}
              {surat.tanggalSelesai && (
                <div className="flex gap-3">
                  <span className="text-xs text-gray-400 w-28 shrink-0">Selesai</span>
                  <span className="text-xs text-gray-700">{formatTanggal(surat.tanggalSelesai)}</span>
                </div>
              )}
            </div>

            {/* Catatan admin */}
            {surat.catatanAdmin && (
              <div className={`mt-4 p-3 rounded-xl text-xs ${isDitolak ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-blue-50 border border-blue-100 text-blue-700'}`}>
                <p className="font-semibold mb-0.5">Catatan dari Admin:</p>
                <p>{surat.catatanAdmin}</p>
              </div>
            )}

            {/* Download surat jadi */}
            {surat.suratJadiUrl && (
              <a
                href={surat.suratJadiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh Surat
              </a>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-5">Riwayat Status</h3>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={i} className="flex gap-4">
                  {/* Dot & line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.current && isDitolak
                        ? 'bg-red-100'
                        : step.done
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      {step.current && isDitolak ? (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : step.done ? (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      )}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${step.done ? 'bg-green-200' : 'bg-gray-100'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-6 pt-1 flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${step.current ? (isDitolak ? 'text-red-700' : 'text-green-700') : step.done ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                    {step.date && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatTanggalJam(step.date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Aksi & Info */}
        <div className="space-y-4">
          {/* Aksi */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Aksi</h3>
            <div className="space-y-2">
              <Link
                href="/surat/ajukan"
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Ajukan Surat Baru
              </Link>
              <Link
                href="/surat"
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Kembali ke Daftar
              </Link>
            </div>
          </div>

          {/* Info pengambilan */}
          {isSelesai && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-green-800">Surat Siap Diambil</p>
              </div>
              <p className="text-xs text-green-700 leading-relaxed">
                Silakan datang ke kantor desa pada jam kerja (Senin–Jumat, 08.00–15.00) 
                untuk mengambil surat dengan membawa KTP asli.
              </p>
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Informasi</p>
            <div className="space-y-2 text-xs text-gray-500">
              <p>• Proses 1–3 hari kerja</p>
              <p>• Notifikasi dikirim tiap update status</p>
              <p>• Surat PENDING dapat dibatalkan</p>
              <p>• Hubungi desa jika ada pertanyaan</p>
            </div>
            <Link href="/chat" className="mt-3 flex items-center gap-1.5 text-xs text-green-600 font-medium hover:text-green-700">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Hubungi tim desa
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}