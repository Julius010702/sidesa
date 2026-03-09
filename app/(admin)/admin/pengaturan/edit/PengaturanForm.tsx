'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

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
  logoUrl: string | null
  bannerUrl: string | null
}

const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

function InputField({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

interface ImageUploaderProps {
  label: string
  hint: string
  tipe: 'logo' | 'banner'
  value: string | null
  onChange: (url: string | null) => void
  aspectClass: string
}

function ImageUploader({ label, hint, tipe, value, onChange, aspectClass }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('gambar', file)
      fd.append('tipe', tipe)
      const res = await fetch('/api/upload-gambar-desa', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        setPreview(data.url)
        onChange(data.url)
      } else {
        setPreview(value)
        onChange(value)
        alert(data.error ?? 'Gagal upload')
      }
    } catch {
      setPreview(value)
      onChange(value)
      alert('Gagal upload gambar')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative ${aspectClass} rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors group`}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt={label}
              fill
              className="object-cover"
              unoptimized={preview.startsWith('blob:')}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded-lg">Ganti Gambar</span>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <svg className="w-7 h-7 text-gray-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-400">Klik untuk upload</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
            <svg className="animate-spin w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Mengupload...' : '📁 Pilih'}
        </button>
        {preview && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
          >
            🗑️ Hapus
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400">{hint}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

// ← nama export diganti jadi PengaturanForm
export function PengaturanForm({ profil }: { profil: ProfilDesa | null }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<Omit<ProfilDesa, 'id'>>({
    namaDesaa:    profil?.namaDesaa    ?? '',
    kepalaDesaa:  profil?.kepalaDesaa  ?? '',
    alamat:       profil?.alamat       ?? '',
    telepon:      profil?.telepon      ?? '',
    email:        profil?.email        ?? '',
    website:      profil?.website      ?? '',
    deskripsi:    profil?.deskripsi    ?? '',
    visi:         profil?.visi         ?? '',
    misi:         profil?.misi         ?? '',
    luasWilayah:  profil?.luasWilayah  ?? null,
    jumlahDusun:  profil?.jumlahDusun  ?? null,
    logoUrl:      profil?.logoUrl      ?? null,
    bannerUrl:    profil?.bannerUrl    ?? null,
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
          namaDesaa:   form.namaDesaa,
          kepalaDesaa: form.kepalaDesaa,
          alamat:      form.alamat,
          telepon:     form.telepon    || null,
          email:       form.email      || null,
          website:     form.website    || null,
          deskripsi:   form.deskripsi  || null,
          visi:        form.visi       || null,
          misi:        form.misi       || null,
          luasWilayah: form.luasWilayah ? Number(form.luasWilayah) : null,
          jumlahDusun: form.jumlahDusun ? Number(form.jumlahDusun) : null,
          logoUrl:     form.logoUrl    ?? null,
          bannerUrl:   form.bannerUrl  ?? null,
        }),
      })
      const data = await res.json()
      if (data.success) setSuccess(true)
      else setError(data.error ?? 'Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5 pb-10">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-800">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium text-green-800">
          ✅ Pengaturan berhasil disimpan!
        </div>
      )}

      <SectionCard title="🖼️ Media Desa">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
          <ImageUploader
            label="Logo Desa"
            hint="PNG transparan, maks 2MB"
            tipe="logo"
            value={form.logoUrl}
            onChange={(url) => set('logoUrl', url)}
            aspectClass="aspect-square w-28"
          />
          <ImageUploader
            label="Banner / Foto Utama Desa"
            hint="Foto landscape 16:9, maks 8MB"
            tipe="banner"
            value={form.bannerUrl}
            onChange={(url) => set('bannerUrl', url)}
            aspectClass="aspect-video w-full"
          />
        </div>
      </SectionCard>

      <SectionCard title="🏛️ Identitas Desa">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Nama Desa" required>
            <input value={form.namaDesaa} onChange={(e) => set('namaDesaa', e.target.value)} placeholder="Nama desa..." className={inputCls} />
          </InputField>
          <InputField label="Kepala Desa" required>
            <input value={form.kepalaDesaa} onChange={(e) => set('kepalaDesaa', e.target.value)} placeholder="Nama kepala desa" className={inputCls} />
          </InputField>
        </div>
        <InputField label="Alamat Kantor" required>
          <input value={form.alamat} onChange={(e) => set('alamat', e.target.value)} placeholder="Jl. ..." className={inputCls} />
        </InputField>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="No. Telepon">
            <input value={form.telepon ?? ''} onChange={(e) => set('telepon', e.target.value)} placeholder="08xx..." className={inputCls} />
          </InputField>
          <InputField label="Email">
            <input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="desa@..." className={inputCls} />
          </InputField>
          <InputField label="Website">
            <input value={form.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="https://..." className={inputCls} />
          </InputField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Luas Wilayah (ha)">
            <input type="number" value={form.luasWilayah ?? ''} onChange={(e) => set('luasWilayah', e.target.value ? parseFloat(e.target.value) : null)} placeholder="0" className={inputCls} />
          </InputField>
          <InputField label="Jumlah Dusun">
            <input type="number" value={form.jumlahDusun ?? ''} onChange={(e) => set('jumlahDusun', e.target.value ? parseInt(e.target.value) : null)} placeholder="0" className={inputCls} />
          </InputField>
        </div>
      </SectionCard>

      <SectionCard title="📝 Profil Desa">
        <InputField label="Deskripsi Singkat">
          <textarea value={form.deskripsi ?? ''} onChange={(e) => set('deskripsi', e.target.value)} rows={3} placeholder="Ceritakan tentang desa secara singkat..." className={`${inputCls} resize-none`} />
        </InputField>
        <InputField label="Visi">
          <textarea value={form.visi ?? ''} onChange={(e) => set('visi', e.target.value)} rows={3} placeholder="Visi desa ke depan..." className={`${inputCls} resize-none`} />
        </InputField>
        <InputField label="Misi">
          <textarea value={form.misi ?? ''} onChange={(e) => set('misi', e.target.value)} rows={4} placeholder="Misi desa (bisa multi-baris)..." className={`${inputCls} resize-none`} />
        </InputField>
      </SectionCard>

      <button
        onClick={handleSave}
        disabled={loading || !form.namaDesaa || !form.kepalaDesaa}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Menyimpan...
          </>
        ) : '💾 Simpan Pengaturan'}
      </button>
    </div>
  )
}