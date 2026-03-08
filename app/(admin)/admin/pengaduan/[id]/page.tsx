'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatTanggal, formatTanggalJam, getStatusColor, getStatusLabel } from '@/lib/utils'
import { PRIORITAS_OPTIONS } from '@/lib/constants'
import HeaderPage from '@/components/layout/HeaderPage'

interface PengaduanData {
  id: string
  judul: string
  deskripsi: string
  kategori: string
  lokasi: string
  fotoUrl: string | null
  status: string
  prioritas: number
  assignedTo: string | null
  catatanAdmin: string | null
  buktiSelesai: string | null
  tanggalLapor: string
  tanggalUpdate: string
  tanggalSelesai: string | null
  user: { id: string; nama: string; nik: string; noHp: string | null }
}

const statusOptions = [
  { value: 'DICEK', label: 'Tandai Sedang Dicek', color: 'bg-blue-500 hover:bg-blue-600' },
  { value: 'DIPROSES', label: 'Tandai Diproses', color: 'bg-amber-500 hover:bg-amber-600' },
  { value: 'SELESAI', label: 'Tandai Selesai', color: 'bg-green-500 hover:bg-green-600' },
  { value: 'DITOLAK', label: 'Tolak Pengaduan', color: 'bg-red-500 hover:bg-red-600' },
]

const kategoriIcon: Record<string, string> = {
  JALAN_RUSAK: '🛣️', LAMPU_MATI: '💡', SAMPAH: '🗑️',
  DRAINASE: '🌊', KEAMANAN: '🔒', SOSIAL: '🤝', LAINNYA: '📋',
}

export default function AdminPengaduanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [data, setData] = useState<PengaduanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    prioritas: 3,
    assignedTo: '',
    catatanAdmin: '',
    buktiSelesai: '',
  })

  useEffect(() => {
    async function load() {
      const { id } = await params
      try {
        const res = await fetch(`/api/pengaduan/${id}`)
        const json = await res.json()
        if (json.success) {
          setData(json.data)
          setForm({
            prioritas: json.data.prioritas ?? 3,
            assignedTo: json.data.assignedTo ?? '',
            catatanAdmin: json.data.catatanAdmin ?? '',
            buktiSelesai: json.data.buktiSelesai ?? '',
          })
        }
      } catch {
        setError('Gagal memuat data pengaduan')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  async function handleUpdate(newStatus?: string) {
    if (!data) return
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/pengaduan/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(newStatus ? { status: newStatus } : {}),
          prioritas: form.prioritas,
          assignedTo: form.assignedTo || undefined,
          catatanAdmin: form.catatanAdmin || undefined,
          buktiSelesai: form.buktiSelesai || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Gagal memperbarui pengaduan')
        return
      }

      setSuccess(newStatus ? `Status diubah ke ${getStatusLabel(newStatus)}` : 'Data berhasil disimpan')
      setData(json.data)
      router.refresh()
    } catch {
      setError('Terjadi kesalahan server')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Memuat data pengaduan...
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Pengaduan tidak ditemukan</p>
        <Link href="/admin/pengaduan" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
          Kembali ke daftar
        </Link>
      </div>
    )
  }

  const canProcess = !['SELESAI', 'DITOLAK'].includes(data.status)

  return (
    <div>
      <HeaderPage
        title="Detail & Proses Pengaduan"
        subtitle={data.judul}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Pengaduan', href: '/admin/pengaduan' },
          { label: 'Detail' },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {kategoriIcon[data.kategori] ?? '📋'}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">{data.judul}</h2>
                  <p className="text-xs text-gray-500">{getStatusLabel(data.kategori)} · {data.lokasi}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${getStatusColor(data.status)}`}>
                {getStatusLabel(data.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Dilaporkan', value: formatTanggalJam(data.tanggalLapor) },
                { label: 'Terakhir Update', value: formatTanggalJam(data.tanggalUpdate) },
                { label: 'Pelapor', value: data.user.nama },
                { label: 'NIK', value: data.user.nik },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Deskripsi Pengaduan</p>
              <p className="text-sm text-gray-700 leading-relaxed">{data.deskripsi}</p>
            </div>

            {data.fotoUrl && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Foto dari Pelapor</p>
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-100">
                  <Image src={data.fotoUrl} alt="Foto pengaduan" fill className="object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Form aksi */}
        <div className="space-y-4">
          {canProcess && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Tindak Lanjut</h3>

              <div className="space-y-4">
                {/* Prioritas */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Prioritas</label>
                  <select
                    value={form.prioritas}
                    onChange={(e) => setForm((p) => ({ ...p, prioritas: parseInt(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    {PRIORITAS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Assigned to */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Ditugaskan ke</label>
                  <input
                    value={form.assignedTo}
                    onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
                    placeholder="Nama petugas / tim..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                {/* Catatan */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Catatan untuk Warga</label>
                  <textarea
                    value={form.catatanAdmin}
                    onChange={(e) => setForm((p) => ({ ...p, catatanAdmin: e.target.value }))}
                    rows={3}
                    placeholder="Perkembangan penanganan atau alasan penolakan..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                {/* URL bukti */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">URL Bukti Selesai</label>
                  <input
                    value={form.buktiSelesai}
                    onChange={(e) => setForm((p) => ({ ...p, buktiSelesai: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleUpdate()}
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  Simpan Catatan
                </button>

                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 pt-1">Ubah Status</p>
                  {statusOptions
                    .filter((opt) => {
                      if (data.status === 'DITERIMA') return ['DICEK', 'DIPROSES', 'DITOLAK'].includes(opt.value)
                      if (data.status === 'DICEK') return ['DIPROSES', 'DITOLAK'].includes(opt.value)
                      if (data.status === 'DIPROSES') return ['SELESAI', 'DITOLAK'].includes(opt.value)
                      return false
                    })
                    .map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleUpdate(opt.value)}
                        disabled={submitting}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 ${opt.color}`}
                      >
                        {submitting ? 'Memproses...' : opt.label}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {!canProcess && (
            <div className={`rounded-2xl p-4 ${data.status === 'SELESAI' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm font-semibold mb-1 ${data.status === 'SELESAI' ? 'text-green-800' : 'text-red-800'}`}>
                {data.status === 'SELESAI' ? '✅ Pengaduan Selesai' : '❌ Pengaduan Ditolak'}
              </p>
              {data.catatanAdmin && (
                <p className={`text-xs ${data.status === 'SELESAI' ? 'text-green-700' : 'text-red-700'}`}>
                  {data.catatanAdmin}
                </p>
              )}
              {data.tanggalSelesai && (
                <p className="text-xs text-gray-400 mt-1">{formatTanggal(data.tanggalSelesai)}</p>
              )}
            </div>
          )}

          <Link
            href="/admin/pengaduan"
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            ← Kembali ke Daftar
          </Link>
        </div>
      </div>
    </div>
  )
}