'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Surat {
  id: string
  jenisSurat: string
  keperluan: string
  status: string
  nomorSurat: string | null
  catatanAdmin: string | null
  fileUrl: string | null
  tanggalDiajukan: string
  tanggalSelesai: string | null
  user: { id: string; nama: string; nik: string; noHp: string | null; email: string }
}

interface ProsesFormProps {
  surat: Surat
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '⏳ Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DIPROSES', label: '🔄 Sedang Diproses', color: 'bg-blue-100 text-blue-800' },
  { value: 'DISETUJUI', label: '✅ Disetujui', color: 'bg-green-100 text-green-800' },
  { value: 'SELESAI', label: '🎉 Selesai', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'DITOLAK', label: '❌ Ditolak', color: 'bg-red-100 text-red-800' },
]

export default function ProsesForm({ surat }: ProsesFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    status: surat.status,
    nomorSurat: surat.nomorSurat ?? '',
    catatanAdmin: surat.catatanAdmin ?? '',
    fileUrl: surat.fileUrl ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/surat/${surat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: form.status,
          nomorSurat: form.nomorSurat || undefined,
          catatanAdmin: form.catatanAdmin || undefined,
          fileUrl: form.fileUrl || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast('error', data.error ?? 'Gagal menyimpan')
        return
      }
      showToast('success', 'Status berhasil diperbarui! Notifikasi telah dikirim ke warga.')
      setTimeout(() => router.refresh(), 1500)
    } catch {
      showToast('error', 'Terjadi kesalahan, periksa koneksi Anda')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all ${
          toast.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status saat ini */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status Pengajuan
          </label>
          <div className="grid grid-cols-1 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  form.status === opt.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={form.status === opt.value}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="sr-only"
                />
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${opt.color}`}>
                  {opt.label}
                </span>
                {form.status === opt.value && (
                  <svg className="w-4 h-4 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Nomor Surat */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Nomor Surat <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            value={form.nomorSurat}
            onChange={(e) => setForm((prev) => ({ ...prev, nomorSurat: e.target.value }))}
            placeholder="Contoh: 474/001/DS/2026"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File URL — muncul saat status SELESAI */}
        {(form.status === 'SELESAI' || form.status === 'DISETUJUI') && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Link File Surat <span className="text-gray-400 font-normal">(URL PDF/Word — opsional)</span>
            </label>
            <input
              type="url"
              value={form.fileUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, fileUrl: e.target.value }))}
              placeholder="https://drive.google.com/... atau link download lainnya"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Jika diisi, warga akan mendapat notifikasi bahwa surat bisa diunduh. Kosongkan jika surat diambil langsung.
            </p>
          </div>
        )}

        {/* Catatan Admin */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Catatan untuk Warga <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <textarea
            value={form.catatanAdmin}
            onChange={(e) => setForm((prev) => ({ ...prev, catatanAdmin: e.target.value }))}
            rows={3}
            placeholder={
              form.status === 'DITOLAK'
                ? 'Jelaskan alasan penolakan...'
                : 'Tambahkan catatan atau instruksi untuk warga...'
            }
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Info notifikasi */}
        {form.status !== surat.status && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700">
              Notifikasi otomatis akan dikirim ke <strong>{surat.user.nama}</strong> saat Anda menyimpan perubahan status ini.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Simpan & Kirim Notifikasi
            </>
          )}
        </button>
      </form>
    </div>
  )
}