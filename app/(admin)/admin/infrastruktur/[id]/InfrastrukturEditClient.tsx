// app/(admin)/admin/infrastruktur/[id]/InfrastrukturEditClient.tsx
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const kondisiOptions = ['BAIK', 'SEDANG', 'RUSAK', 'RUSAK_BERAT']

const kondisiConfig: Record<string, { bg: string; text: string; border: string }> = {
  BAIK:       { bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-200' },
  SEDANG:     { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  RUSAK:      { bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-red-200' },
  RUSAK_BERAT:{ bg: 'bg-red-100',   text: 'text-red-900',    border: 'border-red-300' },
}

const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

interface InfraItem {
  id: string; nama: string; kategori: string; lokasi: string
  deskripsi: string | null; kondisi: string; foto: string | null
  status: string; catatan: string | null
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  )
}

export default function InfrastrukturEditClient({ item }: { item: InfraItem }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [previewFoto, setPreviewFoto] = useState<string | null>(item.foto)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nama: item.nama, kategori: item.kategori, lokasi: item.lokasi,
    deskripsi: item.deskripsi ?? '', kondisi: item.kondisi,
    status: item.status, catatan: item.catatan ?? '', foto: item.foto ?? '',
  })

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewFoto(URL.createObjectURL(file))
    setUploadingFoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'infrastruktur')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success && data.url) {
        setForm((f) => ({ ...f, foto: data.url }))
        setPreviewFoto(data.url)
      } else {
        setError('Gagal mengupload foto')
        setPreviewFoto(item.foto)
      }
    } catch {
      setError('Terjadi kesalahan saat upload foto')
      setPreviewFoto(item.foto)
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleRemoveFoto = () => {
    setPreviewFoto(null)
    setForm((f) => ({ ...f, foto: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/infrastruktur/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, foto: form.foto || null }),
      })
      const data = await res.json()
      if (data.success) {
        setIsEditing(false)
        router.refresh()
      } else {
        setError(data.error ?? 'Gagal menyimpan')
      }
    } catch {
      setError('Terjadi kesalahan koneksi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Hapus data infrastruktur ini? Tindakan tidak dapat dibatalkan.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/infrastruktur/${item.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) router.push('/admin/infrastruktur')
      else setError(data.error ?? 'Gagal menghapus')
    } catch {
      setError('Terjadi kesalahan koneksi')
    } finally {
      setDeleting(false)
    }
  }

  const cfg = kondisiConfig[form.kondisi] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-800">
            ⚠️ {error}
          </div>
        )}

        {/* Foto */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {previewFoto ? (
            <div className="relative group">
              <Image src={previewFoto} alt={item.nama} width={800} height={300}
                className="w-full h-64 object-cover" />
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {uploadingFoto ? (
                    <span className="bg-white text-gray-800 text-xs px-4 py-2 rounded-xl font-semibold shadow">⏳ Mengupload...</span>
                  ) : (
                    <>
                      <label className="bg-white text-blue-700 text-xs px-4 py-2 rounded-xl font-semibold shadow cursor-pointer hover:bg-blue-50 transition-colors">
                        📷 Ganti Foto
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
                      </label>
                      <button onClick={handleRemoveFoto}
                        className="bg-white text-red-600 text-xs px-4 py-2 rounded-xl font-semibold shadow hover:bg-red-50 transition-colors">
                        🗑 Hapus Foto
                      </button>
                    </>
                  )}
                </div>
              )}
              {isEditing && !uploadingFoto && (
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                  Hover foto untuk ganti
                </div>
              )}
            </div>
          ) : isEditing ? (
            <label className="flex flex-col items-center justify-center h-56 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all border-2 border-dashed border-gray-300 m-4 rounded-xl">
              {uploadingFoto ? (
                <div className="text-center">
                  <div className="text-3xl mb-2">⏳</div>
                  <p className="text-sm font-medium text-gray-600">Mengupload...</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-700">Klik untuk upload foto</p>
                  <p className="text-xs font-medium text-gray-500 mt-1">JPG, PNG, WebP · Maks 5MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
            </label>
          ) : (
            <div className="w-full h-48 bg-gray-50 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-400">Belum ada foto</p>
            </div>
          )}
        </div>

        {/* Detail / Form */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">
              {isEditing ? '✏️ Edit Data' : '📋 Detail Infrastruktur'}
            </h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="p-5 space-y-4">
              {[
                { label: 'Nama', key: 'nama', placeholder: 'Nama infrastruktur' },
                { label: 'Kategori', key: 'kategori', placeholder: 'Jalan, Gedung, dll' },
                { label: 'Lokasi', key: 'lokasi', placeholder: 'RT/RW, Dusun...' },
                { label: 'Status', key: 'status', placeholder: 'Aktif, Dalam Perbaikan...' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} className={inputCls} />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kondisi</label>
                <select value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value })}
                  className={inputCls}>
                  {kondisiOptions.map((k) => (
                    <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3} className={`${inputCls} resize-none`} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan</label>
                <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  rows={2} className={`${inputCls} resize-none`} />
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={loading || uploadingFoto}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : '💾 Simpan'}
                </button>
                <button onClick={() => { setIsEditing(false); setPreviewFoto(item.foto); setForm((f) => ({ ...f, foto: item.foto ?? '' })) }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <InfoRow label="Nama" value={item.nama} />
              <InfoRow label="Kategori" value={item.kategori} />
              <InfoRow label="Lokasi" value={item.lokasi} />
              <InfoRow label="Status" value={item.status} />
              <InfoRow label="Deskripsi" value={item.deskripsi} />
              <InfoRow label="Catatan" value={item.catatan} />
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800">⚡ Aksi</h2>
          </div>
          <div className="p-5">
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border mb-4 ${cfg.bg} ${cfg.border}`}>
              <span className={`w-2 h-2 rounded-full ${form.kondisi === 'BAIK' ? 'bg-green-500' : form.kondisi === 'SEDANG' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-bold ${cfg.text}`}>
                {form.kondisi.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="space-y-2">
              <button onClick={() => setIsEditing(true)} disabled={isEditing}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                ✏️ Edit Data
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="w-full py-2.5 border border-red-300 text-red-700 font-semibold rounded-xl text-sm hover:bg-red-50 disabled:opacity-50 transition-colors">
                {deleting ? '⏳ Menghapus...' : '🗑 Hapus'}
              </button>
              <Link href="/admin/infrastruktur"
                className="block text-center py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Kembali
              </Link>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-800 mb-1">📷 Tips Upload Foto</p>
            <p className="text-xs font-medium text-blue-700 leading-relaxed">
              Hover pada foto lalu klik <strong>Ganti Foto</strong> untuk mengganti gambar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}