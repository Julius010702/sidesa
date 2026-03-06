'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const kategoriOptions = ['Pengumuman', 'Berita Desa', 'Kegiatan', 'Pembangunan', 'Sosial', 'Kesehatan', 'Pendidikan', 'Lainnya']

interface Berita {
  id: string
  judul: string
  konten: string
  kategori: string
  excerpt: string | null
  tags: string[]
  isPublished: boolean
  isPinned: boolean
  fotoUrl: string | null
}

export default function EditBeritaClient({ berita }: { berita: Berita }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewFoto, setPreviewFoto] = useState<string | null>(berita.fotoUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    judul: berita.judul,
    konten: berita.konten,
    kategori: berita.kategori,
    excerpt: berita.excerpt ?? '',
    tags: berita.tags.join(', '),
    isPublished: berita.isPublished,
    isPinned: berita.isPinned,
    fotoUrl: berita.fotoUrl ?? '',
  })

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreviewFoto(URL.createObjectURL(file))
    setUploadingFoto(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'berita')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.success && data.url) {
        setForm((f) => ({ ...f, fotoUrl: data.url }))
        setPreviewFoto(data.url)
      } else {
        setError('Gagal mengupload foto')
        setPreviewFoto(berita.fotoUrl)
      }
    } catch {
      setError('Terjadi kesalahan saat upload foto')
      setPreviewFoto(berita.fotoUrl)
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleRemoveFoto = () => {
    setPreviewFoto(null)
    setForm((f) => ({ ...f, fotoUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.judul.trim()) { setError('Judul wajib diisi'); return }
    if (!form.konten.trim()) { setError('Konten wajib diisi'); return }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/berita/${berita.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: form.judul,
          konten: form.konten,
          kategori: form.kategori,
          excerpt: form.excerpt || undefined,
          fotoUrl: form.fotoUrl || null,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          isPublished: publish !== undefined ? publish : form.isPublished,
          isPinned: form.isPinned,
        }),
      })
      const data = await res.json()
      if (data.success) {
        // ✅ Update state lokal, TIDAK pakai router.refresh() yang menyebabkan layar hitam
        setForm((f) => ({ ...f, isPublished: data.data.isPublished }))
        setSuccess('Berita berhasil disimpan')
        setTimeout(() => {
          router.push('/admin/berita')
        }, 800)
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
    if (!confirm('Hapus berita ini? Tindakan tidak dapat dibatalkan.')) return
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`/api/berita/${berita.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/berita')
      } else {
        setError(data.error ?? 'Gagal menghapus')
      }
    } catch {
      setError('Terjadi kesalahan koneksi')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Editor */}
      <div className="lg:col-span-2 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        {/* Upload foto */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto Cover</p>
          </div>
          {previewFoto ? (
            <div className="relative group mx-5 mb-4">
              <Image
                src={previewFoto}
                alt="Cover berita"
                width={800}
                height={300}
                className="w-full h-52 object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-xl">
                {uploadingFoto ? (
                  <span className="bg-white text-gray-700 text-xs px-4 py-2 rounded-xl font-medium shadow">⏳ Mengupload...</span>
                ) : (
                  <>
                    <label className="bg-white text-blue-600 text-xs px-4 py-2 rounded-xl font-semibold shadow cursor-pointer hover:bg-blue-50 transition-colors">
                      📷 Ganti Foto
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} />
                    </label>
                    <button onClick={handleRemoveFoto} className="bg-white text-red-500 text-xs px-4 py-2 rounded-xl font-semibold shadow hover:bg-red-50 transition-colors">
                      🗑 Hapus
                    </button>
                  </>
                )}
              </div>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-lg">
                Hover untuk ganti foto
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center mx-5 mb-4 h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              {uploadingFoto ? (
                <div className="text-center">
                  <div className="text-2xl mb-1">⏳</div>
                  <p className="text-xs text-gray-500">Mengupload...</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs font-medium text-gray-500">Klik untuk upload foto cover</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Maks 5MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
            </label>
          )}
        </div>

        {/* Form konten */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Judul Berita <span className="text-red-500">*</span></label>
            <input
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="Judul berita..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Ringkasan</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              placeholder="Ringkasan singkat berita..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Konten <span className="text-red-500">*</span></label>
            <textarea
              value={form.konten}
              onChange={(e) => setForm({ ...form, konten: e.target.value })}
              rows={16}
              placeholder="Tulis konten berita di sini..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1">{form.konten.length} karakter</p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Aksi publikasi */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Publikasi</p>
          <div className="space-y-2">
            {form.isPublished ? (
              <button onClick={() => handleSave(false)} disabled={loading}
                className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
                Jadikan Draft
              </button>
            ) : (
              <button onClick={() => handleSave(true)} disabled={loading}
                className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
                🚀 Publish
              </button>
            )}
            <button onClick={() => handleSave()} disabled={loading || uploadingFoto}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : '💾 Simpan Perubahan'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <label className="text-xs text-gray-600 font-medium">📌 Pin di atas</label>
            <button
              onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
              className={`w-10 h-5 rounded-full transition-colors ${form.isPinned ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isPinned ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="pt-1">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${form.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {form.isPublished ? '✅ Dipublikasikan' : '📝 Draft'}
            </span>
          </div>
        </div>

        {/* Kategori */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</p>
          <select
            value={form.kategori}
            onChange={(e) => setForm({ ...form, kategori: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* Tags */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</p>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="tag1, tag2, tag3"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">Pisahkan dengan koma</p>
        </div>

        {/* Hapus */}
        <button onClick={handleDelete} disabled={deleting}
          className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
          {deleting ? '⏳ Menghapus...' : '🗑 Hapus Berita'}
        </button>

        <Link href="/admin/berita"
          className="block text-center py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition-colors">
          Kembali
        </Link>
      </div>
    </div>
  )
}