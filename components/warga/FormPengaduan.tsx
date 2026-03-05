'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'

const KATEGORI = [
  { value: 'JALAN_RUSAK', label: '🛣️ Jalan Rusak' },
  { value: 'LAMPU_MATI', label: '💡 Lampu Mati' },
  { value: 'SAMPAH', label: '🗑️ Sampah' },
  { value: 'DRAINASE', label: '💧 Drainase / Selokan' },
  { value: 'KEAMANAN', label: '🔒 Keamanan' },
  { value: 'SOSIAL', label: '👥 Sosial' },
  { value: 'LAINNYA', label: '📋 Lainnya' },
]

export default function FormPengaduan() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ judul: '', deskripsi: '', kategori: '', lokasi: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.judul.trim()) e.judul = 'Judul wajib diisi'
    if (!form.kategori) e.kategori = 'Pilih kategori'
    if (!form.deskripsi.trim() || form.deskripsi.length < 20) e.deskripsi = 'Deskripsi minimal 20 karakter'
    if (!form.lokasi.trim()) e.lokasi = 'Lokasi wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/pengaduan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Pengaduan berhasil dikirim!')
      router.push('/pengaduan')
    } catch {
      toast.error('Gagal mengirim pengaduan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-xl mx-auto shadow-sm">
      <div className="mb-6">
        <h2 className="font-bold text-gray-900 text-lg">Buat Pengaduan</h2>
        <p className="text-sm text-gray-500 mt-1">Sampaikan keluhan atau laporan Anda kepada perangkat desa.</p>
      </div>

      <div className="flex flex-col gap-5">
        <Input label="Judul Pengaduan" placeholder="Contoh: Jalan RT 03 berlubang besar" value={form.judul} onChange={set('judul')} error={errors.judul} required />

        {/* Kategori */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Kategori <span className="text-red-500">*</span></label>
          <select
            value={form.kategori}
            onChange={set('kategori')}
            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow ${errors.kategori ? 'border-red-400' : 'border-gray-200'}`}
          >
            <option value="">-- Pilih Kategori --</option>
            {KATEGORI.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
          {errors.kategori && <p className="text-xs text-red-500">⚠ {errors.kategori}</p>}
        </div>

        <Input label="Lokasi" placeholder="Contoh: RT 03/RW 01, dekat masjid Al-Ikhlas" value={form.lokasi} onChange={set('lokasi')} error={errors.lokasi} required />

        {/* Deskripsi */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Deskripsi <span className="text-red-500">*</span></label>
          <textarea
            rows={4}
            placeholder="Jelaskan masalah secara detail..."
            value={form.deskripsi}
            onChange={set('deskripsi')}
            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-shadow ${errors.deskripsi ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.deskripsi && <p className="text-xs text-red-500">⚠ {errors.deskripsi}</p>}
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={() => router.back()} fullWidth>Batal</Button>
          <Button onClick={handleSubmit} loading={loading} fullWidth>Kirim Pengaduan</Button>
        </div>
      </div>
    </div>
  )
}