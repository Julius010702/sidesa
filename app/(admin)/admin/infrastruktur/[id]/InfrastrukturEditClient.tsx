'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const kondisiOptions = ['BAIK', 'SEDANG', 'RUSAK', 'RUSAK_BERAT']

interface InfraItem {
  id: string
  nama: string
  kategori: string
  lokasi: string
  deskripsi: string | null
  kondisi: string
  foto: string | null
  status: string
  catatan: string | null
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
    nama: item.nama,
    kategori: item.kategori,
    lokasi: item.lokasi,
    deskripsi: item.deskripsi ?? '',
    kondisi: item.kondisi,
    status: item.status,
    catatan: item.catatan ?? '',
    foto: item.foto ?? '',
  })

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setPreviewFoto(localUrl)
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
      if (data.success) {
        router.push('/admin/infrastruktur')
      } else {
        setError(data.error ?? 'Gagal menghapus')
      }
    } catch {
      setError('Terjadi kesalahan koneksi')
    } finally {
      setDeleting(false)
    }
  }

  const kondisiColor: Record<string, string> = {
    BAIK: 'bg-green-100 text-green-700',
    SEDANG: 'bg-yellow-100 text-yellow-700',
    RUSAK: 'bg-red-100 text-red-700',
    RUSAK_BERAT: 'bg-red-200 text-red-800',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Area Foto */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {previewFoto ? (
            <div className="relative group">
              <Image
                src={previewFoto}
                alt={item.nama}
                width={800}
                height={300}
                className="w-full h-64 object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {uploadingFoto ? (
                    <span className="bg-white text-gray-700 text-xs px-4 py-2 rounded-xl font-medium shadow">
                      ⏳ Mengupload...
                    </span>
                  ) : (
                    <>
                      <label className="bg-white text-blue-600 text-xs px-4 py-2 rounded-xl font-semibold shadow cursor-pointer hover:bg-blue-50 transition-colors">
                        📷 Ganti Foto
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
                      </label>
                      <button
                        onClick={handleRemoveFoto}
                        className="bg-white text-red-500 text-xs px-4 py-2 rounded-xl font-semibold shadow hover:bg-red-50 transition-colors"
                      >
                        🗑 Hapus Foto
                      </button>
                    </>
                  )}
                </div>
              )}
              {/* Badge upload hint saat edit */}
              {isEditing && !uploadingFoto && (
                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-lg">
                  Hover foto untuk ganti
                </div>
              )}
            </div>
          ) : isEditing ? (
            <label className="flex flex-col items-center justify-center w-full h-56 cursor-pointer hover:bg-gray-50 transition-colors">
              {uploadingFoto ? (
                <div className="text-center">
                  <div className="text-3xl mb-2">⏳</div>
                  <p className="text-sm text-gray-500">Mengupload foto...</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">Klik untuk upload foto</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Maks 5MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
            </label>
          ) : (
            <div className="w-full h-48 bg-gray-50 flex flex-col items-center justify-center text-gray-300">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Belum ada foto</p>
            </div>
          )}
        </div>

        {/* Form / Detail */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          {isEditing ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Edit Data</p>

              {[
                { label: 'Nama', key: 'nama' },
                { label: 'Kategori', key: 'kategori' },
                { label: 'Lokasi', key: 'lokasi' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{f.label}</label>
                  <input
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Kondisi</label>
                  <select
                    value={form.kondisi}
                    onChange={(e) => setForm({ ...form, kondisi: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {kondisiOptions.map((k) => (
                      <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Status</label>
                  <input
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Catatan</label>
                <textarea
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading || uploadingFoto}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? '⏳ Menyimpan...' : '💾 Simpan'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setPreviewFoto(item.foto)
                    setForm((f) => ({ ...f, foto: item.foto ?? '' }))
                  }}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Nama', value: item.nama },
                { label: 'Kategori', value: item.kategori },
                { label: 'Lokasi', value: item.lokasi },
                { label: 'Status', value: item.status },
                { label: 'Deskripsi', value: item.deskripsi },
                { label: 'Catatan', value: item.catatan },
              ].map(
                (row) =>
                  row.value && (
                    <div key={row.label} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-400 w-24 shrink-0">{row.label}</span>
                      <span className="text-xs text-gray-700 font-medium">{row.value}</span>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kondisi</p>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${kondisiColor[item.kondisi] ?? 'bg-gray-100 text-gray-600'}`}>
              {item.kondisi.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              ✏️ Edit Data
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? '⏳ Menghapus...' : '🗑 Hapus'}
            </button>
            <Link
              href="/admin/infrastruktur"
              className="block text-center py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Kembali
            </Link>
          </div>
        </div>

        {isEditing && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-blue-700 mb-1">📷 Tips Upload Foto</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Hover pada area foto lalu klik <strong>Ganti Foto</strong> untuk mengganti, atau klik area foto jika belum ada gambar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}