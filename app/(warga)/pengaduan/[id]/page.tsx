import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { formatTanggal, formatTanggalJam, getStatusColor, getStatusLabel } from '@/lib/utils'

async function getPengaduan(id: string, userId: string) {
  const p = await prisma.pengaduan.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, nama: true, nik: true, noHp: true } },
    },
  })
  if (!p || p.userId !== userId) return null
  return p
}

type PengaduanDetail = NonNullable<Awaited<ReturnType<typeof getPengaduan>>>

const statusOrder = ['DITERIMA', 'DICEK', 'DIPROSES', 'SELESAI']

const kategoriIcon: Record<string, string> = {
  JALAN_RUSAK: '🛣️',
  LAMPU_MATI: '💡',
  SAMPAH: '🗑️',
  DRAINASE: '🌊',
  KEAMANAN: '🔒',
  SOSIAL: '🤝',
  LAINNYA: '📋',
}

interface TimelineStep {
  label: string
  description: string
  date?: Date | null
  done: boolean
  current: boolean
  isError: boolean
}

function buildTimeline(p: PengaduanDetail): TimelineStep[] {
  const isDitolak = p.status === 'DITOLAK'

  if (isDitolak) {
    return [
      { label: 'Diterima', description: 'Laporan masuk ke sistem', date: p.tanggalLapor, done: true, current: false, isError: false },
      { label: 'Ditolak', description: p.catatanAdmin ?? 'Pengaduan tidak dapat diproses', date: p.tanggalUpdate, done: true, current: true, isError: true },
    ]
  }

  const currentIdx = statusOrder.indexOf(p.status)

  return [
    {
      label: 'Diterima',
      description: 'Laporan masuk dan terdaftar',
      date: p.tanggalLapor,
      done: true,
      current: p.status === 'DITERIMA',
      isError: false,
    },
    {
      label: 'Sedang Dicek',
      description: 'Perangkat desa memverifikasi laporan',
      date: p.status !== 'DITERIMA' ? p.tanggalUpdate : null,
      done: currentIdx >= 1,
      current: p.status === 'DICEK',
      isError: false,
    },
    {
      label: 'Diproses',
      description: 'Tim sedang menangani masalah di lapangan',
      date: p.status === 'DIPROSES' || p.status === 'SELESAI' ? p.tanggalUpdate : null,
      done: currentIdx >= 2,
      current: p.status === 'DIPROSES',
      isError: false,
    },
    {
      label: 'Selesai',
      description: 'Masalah telah berhasil ditangani',
      date: p.tanggalSelesai,
      done: p.status === 'SELESAI',
      current: p.status === 'SELESAI',
      isError: false,
    },
  ]
}

const prioritasLabel: Record<number, { label: string; color: string }> = {
  1: { label: 'Sangat Tinggi', color: 'text-red-700 bg-red-100' },
  2: { label: 'Tinggi', color: 'text-orange-700 bg-orange-100' },
  3: { label: 'Sedang', color: 'text-yellow-700 bg-yellow-100' },
  4: { label: 'Rendah', color: 'text-green-700 bg-green-100' },
  5: { label: 'Sangat Rendah', color: 'text-gray-600 bg-gray-100' },
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ baru?: string }>
}

export default async function DetailPengaduanPage({ params, searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const { baru } = await searchParams

  const pengaduan = await getPengaduan(id, session.userId)
  if (!pengaduan) notFound()

  const timeline = buildTimeline(pengaduan)
  const isDitolak = pengaduan.status === 'DITOLAK'
  const isSelesai = pengaduan.status === 'SELESAI'
  const prioritasInfo = prioritasLabel[pengaduan.prioritas] ?? prioritasLabel[3]

  return (
    <div>
      <HeaderPage
        title="Detail Pengaduan"
        subtitle={pengaduan.judul}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Pengaduan', href: '/pengaduan' },
          { label: 'Detail' },
        ]}
      />

      {baru === '1' && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-5">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Pengaduan Berhasil Dikirim!</p>
            <p className="text-xs text-green-600 mt-0.5">
              Laporan Anda akan segera ditindaklanjuti oleh perangkat desa.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Detail & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {kategoriIcon[pengaduan.kategori] ?? '📋'}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">{pengaduan.judul}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{getStatusLabel(pengaduan.kategori)}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${getStatusColor(pengaduan.status)}`}>
                {getStatusLabel(pengaduan.status)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-28 shrink-0">Lokasi</span>
                <span className="text-xs text-gray-700 font-medium flex-1">{pengaduan.lokasi}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-28 shrink-0">Dilaporkan</span>
                <span className="text-xs text-gray-700">{formatTanggalJam(pengaduan.tanggalLapor)}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-28 shrink-0">Prioritas</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prioritasInfo.color}`}>
                  {prioritasInfo.label}
                </span>
              </div>
              {pengaduan.assignedTo && (
                <div className="flex gap-3">
                  <span className="text-xs text-gray-400 w-28 shrink-0">Ditugaskan</span>
                  <span className="text-xs text-gray-700">{pengaduan.assignedTo}</span>
                </div>
              )}
              {pengaduan.tanggalSelesai && (
                <div className="flex gap-3">
                  <span className="text-xs text-gray-400 w-28 shrink-0">Selesai</span>
                  <span className="text-xs text-gray-700">{formatTanggal(pengaduan.tanggalSelesai)}</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Deskripsi</p>
              <p className="text-sm text-gray-700 leading-relaxed">{pengaduan.deskripsi}</p>
            </div>

            {pengaduan.catatanAdmin && (
              <div className={`mt-4 p-3 rounded-xl text-xs ${isDitolak ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-blue-50 border border-blue-100 text-blue-700'}`}>
                <p className="font-semibold mb-0.5">Catatan dari Admin:</p>
                <p>{pengaduan.catatanAdmin}</p>
              </div>
            )}

            {pengaduan.buktiSelesai && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Bukti Penyelesaian</p>
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-100">
                  <Image
                    src={pengaduan.buktiSelesai}
                    alt="Bukti penyelesaian pengaduan"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-5">Riwayat Status</h3>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.isError ? 'bg-red-100' : step.done ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      {step.isError ? (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : step.done ? (
                        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      )}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${step.done ? 'bg-orange-200' : 'bg-gray-100'}`} />
                    )}
                  </div>
                  <div className="pb-6 pt-1 flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${
                      step.isError ? 'text-red-700' : step.current ? 'text-orange-700' : step.done ? 'text-gray-800' : 'text-gray-400'
                    }`}>
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
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Aksi</h3>
            <div className="space-y-2">
              <Link
                href="/pengaduan/buat"
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Buat Pengaduan Baru
              </Link>
              <Link
                href="/pengaduan"
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Kembali ke Daftar
              </Link>
            </div>
          </div>

          {isSelesai && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-green-800">Pengaduan Selesai</p>
              </div>
              <p className="text-xs text-green-700 leading-relaxed">
                Terima kasih telah melaporkan masalah ini. Partisipasi Anda sangat membantu kemajuan desa.
              </p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Informasi</p>
            <div className="space-y-2 text-xs text-gray-500">
              <p>• Pengaduan diproses sesuai prioritas</p>
              <p>• Notifikasi dikirim tiap update</p>
              <p>• Sertakan foto untuk proses lebih cepat</p>
              <p>• Hubungi desa untuk info lebih lanjut</p>
            </div>
            <Link href="/chat" className="mt-3 flex items-center gap-1.5 text-xs text-orange-600 font-medium hover:text-orange-700">
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