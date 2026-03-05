'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HeaderPage from '@/components/layout/HeaderPage'
import { JENIS_SURAT_OPTIONS } from '@/lib/constants'

const infoSurat: Record<string, { deskripsi: string; syarat: string[] }> = {
  DOMISILI: {
    deskripsi: 'Surat keterangan bahwa Anda berdomisili di desa ini.',
    syarat: ['Fotokopi KTP', 'Fotokopi KK'],
  },
  KETERANGAN_USAHA: {
    deskripsi: 'Surat keterangan bahwa Anda memiliki usaha di wilayah desa.',
    syarat: ['Fotokopi KTP', 'Fotokopi KK', 'Foto tempat usaha'],
  },
  TIDAK_MAMPU: {
    deskripsi: 'Surat keterangan kondisi ekonomi tidak mampu untuk keperluan administrasi.',
    syarat: ['Fotokopi KTP', 'Fotokopi KK', 'Surat pengantar RT/RW'],
  },
  PENGANTAR_KTP: {
    deskripsi: 'Surat pengantar untuk pembuatan atau perpanjangan KTP.',
    syarat: ['Fotokopi KK', 'Foto 3x4 (2 lembar)'],
  },
  PENGANTAR_KK: {
    deskripsi: 'Surat pengantar untuk pembuatan atau perubahan Kartu Keluarga.',
    syarat: ['Fotokopi KTP', 'Dokumen pendukung perubahan KK'],
  },
  PENGANTAR_SKCK: {
    deskripsi: 'Surat pengantar dari desa untuk pembuatan SKCK di kepolisian.',
    syarat: ['Fotokopi KTP', 'Fotokopi KK', 'Pas foto 4x6 (2 lembar)'],
  },
  LAINNYA: {
    deskripsi: 'Surat keterangan lainnya sesuai keperluan Anda.',
    syarat: ['Dokumen pendukung sesuai keperluan'],
  },
}

export default function AjukanSuratPage() {
  const router = useRouter()
  const [form, setForm] = useState({ jenisSurat: '', keperluan: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const selectedInfo = form.jenisSurat ? infoSurat[form.jenisSurat] : null

  function handleChange(
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!form.jenisSurat) errors.jenisSurat = 'Pilih jenis surat'
    if (form.keperluan.trim().length < 5) errors.keperluan = 'Keperluan minimal 5 karakter'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal mengajukan surat')
        return
      }

      router.push(`/surat/${data.data.id}?baru=1`)
    } catch {
      setError('Terjadi kesalahan, periksa koneksi Anda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <HeaderPage
        title="Ajukan Surat Baru"
        subtitle="Isi formulir pengajuan surat keterangan"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Surat', href: '/surat' },
          { label: 'Ajukan' },
        ]}
      />

      <div className="max-w-2xl">
        {/* Info card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
          <div className="text-blue-500 mt-0.5 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">Informasi Pengajuan</p>
            <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
              Surat akan diproses oleh perangkat desa dalam 1–3 hari kerja. Anda akan mendapatkan
              notifikasi setiap kali status berubah.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          {/* Jenis Surat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Jenis Surat <span className="text-red-500">*</span>
            </label>
            <select
              name="jenisSurat"
              value={form.jenisSurat}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                transition-all ${fieldErrors.jenisSurat ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            >
              <option value="">-- Pilih jenis surat --</option>
              {JENIS_SURAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {fieldErrors.jenisSurat && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.jenisSurat}</p>
            )}
          </div>

          {/* Info jenis surat terpilih */}
          {selectedInfo && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-sm text-green-800 font-medium mb-2">{selectedInfo.deskripsi}</p>
              <p className="text-xs font-semibold text-green-700 mb-1">Dokumen yang perlu disiapkan:</p>
              <ul className="space-y-1">
                {selectedInfo.syarat.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-green-700">
                    <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keperluan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Keperluan / Keterangan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="keperluan"
              value={form.keperluan}
              onChange={handleChange}
              rows={4}
              placeholder="Jelaskan keperluan pengajuan surat ini secara singkat dan jelas..."
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                transition-all placeholder:text-gray-300
                ${fieldErrors.keperluan ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.keperluan ? (
                <p className="text-xs text-red-600">{fieldErrors.keperluan}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-400">{form.keperluan.length} karakter</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Link
              href="/surat"
              className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-xl
                font-semibold text-sm hover:from-green-700 hover:to-emerald-700 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Mengajukan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Ajukan Surat
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}