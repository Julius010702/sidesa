'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

const JENIS_SURAT = [
  { value: 'DOMISILI', label: 'Surat Keterangan Domisili' },
  { value: 'KETERANGAN_USAHA', label: 'Surat Keterangan Usaha' },
  { value: 'TIDAK_MAMPU', label: 'Surat Keterangan Tidak Mampu' },
  { value: 'PENGANTAR_KTP', label: 'Surat Pengantar KTP' },
  { value: 'PENGANTAR_KK', label: 'Surat Pengantar KK' },
  { value: 'PENGANTAR_SKCK', label: 'Surat Pengantar SKCK' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

export default function FormAjukanSurat() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ jenisSurat: '', keperluan: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.jenisSurat) e.jenisSurat = 'Pilih jenis surat'
    if (!form.keperluan.trim()) e.keperluan = 'Keperluan wajib diisi'
    if (form.keperluan.length < 10) e.keperluan = 'Keperluan minimal 10 karakter'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Surat berhasil diajukan!')
      router.push('/surat')
    } catch {
      toast.error('Gagal mengajukan surat. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-xl mx-auto shadow-sm">
      <div className="mb-6">
        <h2 className="font-bold text-gray-900 text-lg">Ajukan Surat Baru</h2>
        <p className="text-sm text-gray-500 mt-1">Isi form berikut untuk mengajukan surat ke kantor desa.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Jenis Surat */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Jenis Surat <span className="text-red-500">*</span>
          </label>
          <select
            value={form.jenisSurat}
            onChange={e => setForm(f => ({ ...f, jenisSurat: e.target.value }))}
            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow ${
              errors.jenisSurat ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <option value="">-- Pilih Jenis Surat --</option>
            {JENIS_SURAT.map(j => (
              <option key={j.value} value={j.value}>{j.label}</option>
            ))}
          </select>
          {errors.jenisSurat && <p className="text-xs text-red-500">⚠ {errors.jenisSurat}</p>}
        </div>

        {/* Keperluan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Keperluan / Keterangan <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Jelaskan keperluan pengajuan surat ini..."
            value={form.keperluan}
            onChange={e => setForm(f => ({ ...f, keperluan: e.target.value }))}
            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-shadow ${
              errors.keperluan ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.keperluan && <p className="text-xs text-red-500">⚠ {errors.keperluan}</p>}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
          ℹ️ Surat akan diproses dalam 1–3 hari kerja. Anda akan menerima notifikasi saat surat siap diambil.
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={() => router.back()} fullWidth>
            Batal
          </Button>
          <Button onClick={handleSubmit} loading={loading} fullWidth>
            Ajukan Surat
          </Button>
        </div>
      </div>
    </div>
  )
}