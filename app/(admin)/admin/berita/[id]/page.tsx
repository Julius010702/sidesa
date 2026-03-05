'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
}

export default function EditBeritaClient({ berita }: { berita: Berita }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    judul: berita.judul,
    konten: berita.konten,
    kategori: berita.kategori,
    excerpt: berita.excerpt ?? '',
    tags: berita.tags.join(', '),
    isPublished: berita.isPublished,
    isPinned: berita.isPinned,
  })

  const handleSave = async (publish?: boolean) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/berita/${berita.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: form.judul,
          konten: form.konten,
          kategori: form.kategori,
          excerpt: form.excerpt || undefined,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          isPublished: publish !== undefined ? publish : form.isPublished,
          isPinned: form.isPinned,
        }),
      })
      const data = await res.json()
      if (data.success) router.push('/admin/berita')
      else setError(data.error ?? 'Gagal menyimpan')
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Hapus berita ini? Tindakan tidak dapat dibatalkan.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/berita/${berita.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) router.push('/admin/berita')
      else setError(data.error ?? 'Gagal menghapus')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Link href="/admin/dashboard" className="hover:text-gray-600">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/berita" className="hover:text-gray-600">Berita</Link>
          <span>/</span>
          <span className="text-gray-600">Edit</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Edit Berita</h1>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Judul</label>
              <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Ringkasan</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Konten</label>
              <textarea value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })}
                rows={16} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono leading-relaxed" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Publikasi</p>
            <div className="space-y-2">
              {form.isPublished ? (
                <button onClick={() => handleSave(false)} disabled={loading}
                  className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
                  Jadikan Draft
                </button>
              ) : (
                <button onClick={() => handleSave(true)} disabled={loading}
                  className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
                  Publish
                </button>
              )}
              <button onClick={() => handleSave()} disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <label className="text-xs text-gray-600 font-medium">📌 Pin di atas</label>
              <button onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
                className={`w-10 h-5 rounded-full transition-colors ${form.isPinned ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isPinned ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</p>
            <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</p>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button onClick={handleDelete} disabled={deleting}
            className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
            {deleting ? 'Menghapus...' : '🗑 Hapus Berita'}
          </button>

          <Link href="/admin/berita" className="block text-center py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Batal
          </Link>
        </div>
      </div>
    </div>
  )
}
