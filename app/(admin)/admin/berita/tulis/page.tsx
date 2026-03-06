// app/(admin)/admin/berita/tulis/page.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const kategoriOptions = ['Pengumuman', 'Berita Desa', 'Kegiatan', 'Pembangunan', 'Sosial', 'Kesehatan', 'Pendidikan', 'Lainnya']

const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

export default function TulisBeritaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [error, setError] = useState('')
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    judul: '', konten: '', kategori: 'Pengumuman',
    excerpt: '', tags: '', isPinned: false, fotoUrl: '',
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
        setPreviewFoto(null)
      }
    } catch {
      setError('Terjadi kesalahan saat upload foto')
      setPreviewFoto(null)
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleRemoveFoto = () => {
    setPreviewFoto(null)
    setForm((f) => ({ ...f, fotoUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (publish: boolean) => {
    if (!form.judul.trim()) { setError('Judul wajib diisi'); return }
    if (!form.konten.trim()) { setError('Konten wajib diisi'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: form.judul, konten: form.konten, kategori: form.kategori,
          excerpt: form.excerpt || undefined, fotoUrl: form.fotoUrl || null,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          isPublished: publish, isPinned: form.isPinned,
        }),
      })
      const data = await res.json()
      if (data.success) router.push('/admin/berita')
      else setError(data.error ?? 'Gagal menyimpan')
    } catch {
      setError('Terjadi kesalahan koneksi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
          <Link href="/admin/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <span className="text-gray-300">/</span>
          <Link href="/admin/berita" className="hover:text-gray-800 transition-colors">Berita</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">Tulis Baru</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Tulis Berita Baru</h1>
        <p className="text-sm text-gray-600 mt-0.5">Buat artikel berita atau pengumuman untuk warga</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-800">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Editor kiri */}
        <div className="lg:col-span-2 space-y-4">

          {/* Upload foto cover */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">🖼 Foto Cover</h2>
            </div>
            <div className="p-5">
              {previewFoto ? (
                <div className="relative group">
                  <Image src={previewFoto} alt="Preview foto cover" width={800} height={300}
                    className="w-full h-52 object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-xl">
                    {uploadingFoto ? (
                      <span className="bg-white text-gray-800 text-xs px-4 py-2 rounded-xl font-semibold shadow">⏳ Mengupload...</span>
                    ) : (
                      <>
                        <label className="bg-white text-blue-700 text-xs px-4 py-2 rounded-xl font-semibold shadow cursor-pointer hover:bg-blue-50 transition-colors">
                          📷 Ganti Foto
                          <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} />
                        </label>
                        <button onClick={handleRemoveFoto}
                          className="bg-white text-red-600 text-xs px-4 py-2 rounded-xl font-semibold shadow hover:bg-red-50 transition-colors">
                          🗑 Hapus
                        </button>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                    Hover untuk ganti foto
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all">
                  {uploadingFoto ? (
                    <div className="text-center">
                      <div className="text-2xl mb-1">⏳</div>
                      <p className="text-xs font-medium text-gray-600">Mengupload...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-700">Klik untuk upload foto cover</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">JPG, PNG, WebP · Maks 5MB</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={uploadingFoto} />
                </label>
              )}
            </div>
          </div>

          {/* Form konten */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">✏️ Konten Berita</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Judul Berita <span className="text-red-500">*</span>
                </label>
                <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Masukkan judul berita yang menarik..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ringkasan (Excerpt)</label>
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2} placeholder="Ringkasan singkat berita (opsional)..."
                  className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Konten Berita <span className="text-red-500">*</span>
                </label>
                <textarea value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })}
                  rows={16} placeholder="Tulis konten berita di sini..."
                  className={`${inputCls} resize-none font-mono leading-relaxed`} />
                <p className="text-xs font-medium text-gray-500 mt-1">{form.konten.length} karakter</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar kanan */}
        <div className="space-y-4">
          {/* Publikasi */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">🚀 Publikasi</h2>
            </div>
            <div className="p-5 space-y-3">
              <button onClick={() => handleSubmit(true)}
                disabled={loading || uploadingFoto || !form.judul || !form.konten}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : '🚀 Publish Sekarang'}
              </button>
              <button onClick={() => handleSubmit(false)}
                disabled={loading || uploadingFoto || !form.judul || !form.konten}
                className="w-full py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors">
                💾 Simpan sebagai Draft
              </button>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-700">📌 Pin di atas</span>
                <button onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.isPinned ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isPinned ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Kategori */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">🏷 Kategori</h2>
            </div>
            <div className="p-5">
              <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className={inputCls}>
                {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">🔖 Tags</h2>
            </div>
            <div className="p-5">
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tag1, tag2, tag3" className={inputCls} />
              <p className="text-xs font-medium text-gray-500 mt-2">Pisahkan dengan koma</p>
            </div>
          </div>

          <Link href="/admin/berita"
            className="block text-center py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Batal
          </Link>
        </div>
      </div>
    </div>
  )
}