'use client'

import { useState } from 'react'

interface ProfilDesa {
  id?: string
  namaDesaa: string
  kepalaDesaa: string
  alamat: string
  telepon: string | null
  email: string | null
  website: string | null
  deskripsi: string | null
  visi: string | null
  misi: string | null
  luasWilayah: number | null
  jumlahDusun: number | null
}

export default function PengaturanClient({ profil }: { profil: ProfilDesa | null }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<Omit<ProfilDesa, 'id'>>({
    namaDesaa: profil?.namaDesaa ?? '',
    kepalaDesaa: profil?.kepalaDesaa ?? '',
    alamat: profil?.alamat ?? '',
    telepon: profil?.telepon ?? '',
    email: profil?.email ?? '',
    website: profil?.website ?? '',
    deskripsi: profil?.deskripsi ?? '',
    visi: profil?.visi ?? '',
    misi: profil?.misi ?? '',
    luasWilayah: profil?.luasWilayah ?? null,
    jumlahDusun: profil?.jumlahDusun ?? null,
  })

  const set = (key: keyof typeof form, value: string | number | null) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/profil-desa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          luasWilayah: form.luasWilayah ? Number(form.luasWilayah) : undefined,
          jumlahDusun: form.jumlahDusun ? Number(form.jumlahDusun) : undefined,
          email: form.email || undefined,
          website: form.website || undefined,
          telepon: form.telepon || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) setSuccess(true)
      else setError(data.error ?? 'Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="max-w-2xl space-y-5">
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">✓ Pengaturan berhasil disimpan!</div>}

      {/* Identitas Desa */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Identitas Desa</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nama Desa" required>
            <input value={form.namaDesaa} onChange={(e) => set('namaDesaa', e.target.value)} className={inputClass} placeholder="Desa ..." />
          </Field>
          <Field label="Kepala Desa" required>
            <input value={form.kepalaDesaa} onChange={(e) => set('kepalaDesaa', e.target.value)} className={inputClass} placeholder="Nama kepala desa" />
          </Field>
        </div>
        <Field label="Alamat Kantor" required>
          <input value={form.alamat} onChange={(e) => set('alamat', e.target.value)} className={inputClass} placeholder="Jl. ..." />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="No. Telepon">
            <input value={form.telepon ?? ''} onChange={(e) => set('telepon', e.target.value)} className={inputClass} placeholder="08xx..." />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} className={inputClass} placeholder="desa@..." />
          </Field>
          <Field label="Website">
            <input value={form.website ?? ''} onChange={(e) => set('website', e.target.value)} className={inputClass} placeholder="https://..." />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Luas Wilayah (ha)">
            <input type="number" value={form.luasWilayah ?? ''} onChange={(e) => set('luasWilayah', e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} placeholder="0" />
          </Field>
          <Field label="Jumlah Dusun">
            <input type="number" value={form.jumlahDusun ?? ''} onChange={(e) => set('jumlahDusun', e.target.value ? parseInt(e.target.value) : null)} className={inputClass} placeholder="0" />
          </Field>
        </div>
      </div>

      {/* Profil */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Profil Desa</p>
        <Field label="Deskripsi Singkat">
          <textarea value={form.deskripsi ?? ''} onChange={(e) => set('deskripsi', e.target.value)}
            rows={3} className={`${inputClass} resize-none`} placeholder="Tentang desa..." />
        </Field>
        <Field label="Visi">
          <textarea value={form.visi ?? ''} onChange={(e) => set('visi', e.target.value)}
            rows={3} className={`${inputClass} resize-none`} placeholder="Visi desa..." />
        </Field>
        <Field label="Misi">
          <textarea value={form.misi ?? ''} onChange={(e) => set('misi', e.target.value)}
            rows={4} className={`${inputClass} resize-none`} placeholder="Misi desa (bisa multi-baris)..." />
        </Field>
      </div>

      <button onClick={handleSave} disabled={loading || !form.namaDesaa || !form.kepalaDesaa}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </div>
  )
}
