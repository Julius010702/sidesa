'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HeaderPage from '@/components/layout/HeaderPage'
import { KATEGORI_PENGADUAN_OPTIONS } from '@/lib/constants'

const kategoriInfo: Record<string, { icon: string; tip: string }> = {
  JALAN_RUSAK: { icon: '🛣️', tip: 'Sertakan lokasi jalan yang rusak dan tingkat kerusakan.' },
  LAMPU_MATI: { icon: '💡', tip: 'Sebutkan nomor tiang atau lokasi tepat lampu yang mati.' },
  SAMPAH: { icon: '🗑️', tip: 'Jelaskan lokasi timbunan sampah dan sudah berapa lama.' },
  DRAINASE: { icon: '🌊', tip: 'Sebutkan RT/RW dan lokasi drainase yang bermasalah.' },
  KEAMANAN: { icon: '🔒', tip: 'Jelaskan kejadian dengan detail waktu dan tempat.' },
  SOSIAL: { icon: '🤝', tip: 'Ceritakan masalah sosial yang terjadi di lingkungan Anda.' },
  LAINNYA: { icon: '📋', tip: 'Jelaskan masalah sedetail mungkin agar mudah ditindaklanjuti.' },
}

export default function BuatPengaduanPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    kategori: '',
    lokasi: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const selectedInfo = form.kategori ? kategoriInfo[form.kategori] : null

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (form.judul.trim().length < 5) errors.judul = 'Judul minimal 5 karakter'
    if (!form.kategori) errors.kategori = 'Pilih kategori pengaduan'
    if (form.deskripsi.trim().length < 10) errors.deskripsi = 'Deskripsi minimal 10 karakter'
    if (form.lokasi.trim().length < 5) errors.lokasi = 'Lokasi minimal 5 karakter'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/pengaduan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal mengirim pengaduan')
        return
      }

      router.push(`/pengaduan/${data.data.id}?baru=1`)
    } catch {
      setError('Terjadi kesalahan, periksa koneksi Anda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <HeaderPage
        title="Buat Pengaduan"
        subtitle="Laporkan masalah di lingkungan Anda"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Pengaduan', href: '/pengaduan' },
          { label: 'Buat' },
        ]}
      />

      <div className="max-w-2xl">
        {/* Info */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex gap-3">
          <div className="text-orange-500 mt-0.5 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-800">Panduan Pengaduan</p>
            <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
              Pengaduan yang detail dan jelas akan lebih cepat ditindaklanjuti.
              Sertakan lokasi yang spesifik dan foto jika memungkinkan.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kategori <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-1">
              {KATEGORI_PENGADUAN_OPTIONS.map((opt) => {
                const info = kategoriInfo[opt.value]
                const isSelected = form.kategori === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, kategori: opt.value }))
                      setFieldErrors((prev) => ({ ...prev, kategori: '' }))
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                      isSelected
                        ? 'border-orange-400 bg-orange-50 text-orange-800 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'
                    }`}
                  >
                    <span className="text-base">{info?.icon}</span>
                    <span className="text-xs leading-tight">{opt.label}</span>
                  </button>
                )
              })}
            </div>
            {fieldErrors.kategori && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.kategori}</p>
            )}
            {selectedInfo && (
              <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mt-2">
                💡 {selectedInfo.tip}
              </p>
            )}
          </div>

          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Judul Pengaduan <span className="text-red-500">*</span>
            </label>
            <input
              name="judul"
              type="text"
              value={form.judul}
              onChange={handleChange}
              placeholder="Contoh: Jalan depan SD Negeri 1 berlubang besar"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                transition-all placeholder:text-gray-300
                ${fieldErrors.judul ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {fieldErrors.judul && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.judul}</p>
            )}
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lokasi Kejadian <span className="text-red-500">*</span>
            </label>
            <input
              name="lokasi"
              type="text"
              value={form.lokasi}
              onChange={handleChange}
              placeholder="Contoh: Jl. Mawar No. 5, RT 02/RW 03"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                transition-all placeholder:text-gray-300
                ${fieldErrors.lokasi ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {fieldErrors.lokasi && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.lokasi}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              rows={5}
              placeholder="Jelaskan masalah secara detail: kondisi saat ini, dampak yang dirasakan warga, sudah berapa lama terjadi..."
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                transition-all placeholder:text-gray-300
                ${fieldErrors.deskripsi ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.deskripsi ? (
                <p className="text-xs text-red-600">{fieldErrors.deskripsi}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-400">{form.deskripsi.length} karakter</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Link
              href="/pengaduan"
              className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-linear-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl
                font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mengirim...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Kirim Pengaduan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}