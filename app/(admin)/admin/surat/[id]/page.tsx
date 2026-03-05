'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatTanggal, formatTanggalJam, getStatusColor, getStatusLabel } from '@/lib/utils'
// ✅ FIX: Removed unused 'JENIS_SURAT_OPTIONS' import to fix @typescript-eslint/no-unused-vars
import HeaderPage from '@/components/layout/HeaderPage'

interface SuratData {
  id: string
  jenisSurat: string
  keperluan: string
  status: string
  nomorSurat: string | null
  catatanAdmin: string | null
  suratJadiUrl: string | null
  tanggalDiajukan: string
  tanggalDiproses: string | null
  tanggalSelesai: string | null
  user: { id: string; nama: string; nik: string; noHp: string | null; email: string }
}

const statusOptions = [
  { value: 'DIPROSES', label: 'Tandai Diproses', color: 'bg-blue-500 hover:bg-blue-600' },
  { value: 'DISETUJUI', label: 'Setujui Surat', color: 'bg-green-500 hover:bg-green-600' },
  { value: 'DITOLAK', label: 'Tolak Surat', color: 'bg-red-500 hover:bg-red-600' },
  { value: 'SELESAI', label: 'Tandai Selesai', color: 'bg-emerald-500 hover:bg-emerald-600' },
]

export default function AdminSuratDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [surat, setSurat] = useState<SuratData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    status: '',
    catatanAdmin: '',
    nomorSurat: '',
    suratJadiUrl: '',
  })

  useEffect(() => {
    async function load() {
      const { id } = await params
      try {
        const res = await fetch(`/api/surat/${id}`)
        const data = await res.json()
        if (data.success) {
          setSurat(data.data)
          setForm((prev) => ({
            ...prev,
            nomorSurat: data.data.nomorSurat ?? '',
            catatanAdmin: data.data.catatanAdmin ?? '',
            suratJadiUrl: data.data.suratJadiUrl ?? '',
          }))
        }
      } catch {
        setError('Gagal memuat data surat')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  async function handleUpdate(newStatus: string) {
    if (!surat) return
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/surat/${surat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          catatanAdmin: form.catatanAdmin || undefined,
          nomorSurat: form.nomorSurat || undefined,
          suratJadiUrl: form.suratJadiUrl || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal memperbarui surat')
        return
      }

      setSuccess(`Status berhasil diubah ke ${getStatusLabel(newStatus)}`)
      setSurat(data.data)
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
          Memuat data surat...
        </div>
      </div>
    )
  }

  if (!surat) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Surat tidak ditemukan</p>
        <Link href="/admin/surat" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
          Kembali ke daftar
        </Link>
      </div>
    )
  }

  const canProcess = !['SELESAI', 'DITOLAK'].includes(surat.status)

  return (
    <div>
      <HeaderPage
        title="Detail & Proses Surat"
        subtitle={`${surat.user.nama} · ${getStatusLabel(surat.jenisSurat)}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Surat', href: '/admin/surat' },
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
        {/* Left: Info surat & pemohon */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info surat */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="font-bold text-gray-900">Informasi Surat</h2>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${getStatusColor(surat.status)}`}>
                {getStatusLabel(surat.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Jenis Surat</p>
                  <p className="text-sm font-semibold text-gray-800">{getStatusLabel(surat.jenisSurat)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Keperluan</p>
                  <p className="text-sm text-gray-700">{surat.keperluan}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tanggal Pengajuan</p>
                  <p className="text-sm text-gray-700">{formatTanggalJam(surat.tanggalDiajukan)}</p>
                </div>
              </div>
              <div className="space-y-3">
                {surat.nomorSurat && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Nomor Surat</p>
                    <p className="text-sm font-mono text-gray-800">{surat.nomorSurat}</p>
                  </div>
                )}
                {surat.tanggalDiproses && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Tanggal Diproses</p>
                    <p className="text-sm text-gray-700">{formatTanggal(surat.tanggalDiproses)}</p>
                  </div>
                )}
                {surat.tanggalSelesai && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Tanggal Selesai</p>
                    <p className="text-sm text-gray-700">{formatTanggal(surat.tanggalSelesai)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info pemohon */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h2 className="font-bold text-gray-900 mb-4">Data Pemohon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Nama Lengkap', value: surat.user.nama },
                { label: 'NIK', value: surat.user.nik },
                { label: 'Email', value: surat.user.email },
                { label: 'No. HP', value: surat.user.noHp ?? '-' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form proses */}
        <div className="space-y-4">
          {canProcess ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Proses Surat</h3>

              <div className="space-y-4">
                {/* Nomor surat */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Nomor Surat
                    <span className="text-gray-400 font-normal ml-1">(auto jika kosong)</span>
                  </label>
                  <input
                    value={form.nomorSurat}
                    onChange={(e) => setForm((p) => ({ ...p, nomorSurat: e.target.value }))}
                    placeholder="Contoh: 001/DOM/DESA/01/2025"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* URL surat jadi */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    URL Surat (opsional)
                  </label>
                  <input
                    value={form.suratJadiUrl}
                    onChange={(e) => setForm((p) => ({ ...p, suratJadiUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Catatan */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Catatan untuk Warga
                  </label>
                  <textarea
                    value={form.catatanAdmin}
                    onChange={(e) => setForm((p) => ({ ...p, catatanAdmin: e.target.value }))}
                    rows={3}
                    placeholder="Catatan atau alasan penolakan..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Action buttons */}
                <div className="space-y-2 pt-1">
                  {statusOptions
                    .filter((opt) => {
                      if (surat.status === 'PENDING') return ['DIPROSES', 'DISETUJUI', 'DITOLAK'].includes(opt.value)
                      if (surat.status === 'DIPROSES') return ['DISETUJUI', 'DITOLAK'].includes(opt.value)
                      if (surat.status === 'DISETUJUI') return ['SELESAI', 'DITOLAK'].includes(opt.value)
                      return false
                    })
                    .map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleUpdate(opt.value)}
                        disabled={submitting}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${opt.color}`}
                      >
                        {submitting ? 'Memproses...' : opt.label}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl p-4 ${surat.status === 'SELESAI' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm font-semibold mb-1 ${surat.status === 'SELESAI' ? 'text-green-800' : 'text-red-800'}`}>
                {surat.status === 'SELESAI' ? '✅ Surat Selesai' : '❌ Surat Ditolak'}
              </p>
              {surat.catatanAdmin && (
                <p className={`text-xs ${surat.status === 'SELESAI' ? 'text-green-700' : 'text-red-700'}`}>
                  {surat.catatanAdmin}
                </p>
              )}
            </div>
          )}

          <Link
            href="/admin/surat"
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            ← Kembali ke Daftar
          </Link>
        </div>
      </div>
    </div>
  )
}