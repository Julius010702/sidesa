'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'

interface BeritaEditorProps {
  initialData?: {
    id?: string
    judul?: string
    konten?: string
    excerpt?: string
    kategori?: string
    tags?: string[]
    isPublished?: boolean
    isPinned?: boolean
  }
}

const KATEGORI = ['Pengumuman', 'Kesehatan', 'Pendidikan', 'Ekonomi', 'Infrastruktur', 'Sosial', 'Acara', 'Lainnya']

export default function BeritaEditor({ initialData = {} }: BeritaEditorProps) {
  const router = useRouter()
  const isEdit = !!initialData.id
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    judul: initialData.judul || '',
    konten: initialData.konten || '',
    excerpt: initialData.excerpt || '',
    kategori: initialData.kategori || '',
    tagsInput: initialData.tags?.join(', ') || '',
    isPublished: initialData.isPublished || false,
    isPinned: initialData.isPinned || false,
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = async (publish = false) => {
    if (!form.judul.trim() || !form.konten.trim()) {
      toast.error('Judul dan konten wajib diisi')
      return
    }
    setLoading(true)
    try {
      const tags = form.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      const slug = form.judul.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
      const payload = { ...form, tags, slug, isPublished: publish || form.isPublished }

      const res = await fetch(isEdit ? `/api/berita/${initialData.id}` : '/api/berita', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success(publish ? 'Berita dipublikasikan!' : 'Draft tersimpan!')
      router.push('/admin/berita')
    } catch {
      toast.error('Gagal menyimpan berita')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor utama */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Konten Berita</h3>
          <div className="flex flex-col gap-4">
            <Input label="Judul Berita" placeholder="Tulis judul yang menarik..." value={form.judul} onChange={set('judul')} required />

            {/* Excerpt */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Ringkasan / Excerpt</label>
              <textarea
                rows={2}
                placeholder="Ringkasan singkat untuk preview berita..."
                value={form.excerpt}
                onChange={set('excerpt')}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Konten */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Isi Berita <span className="text-red-500">*</span>
              </label>
              {/* Toolbar sederhana */}
              <div className="flex gap-1 flex-wrap border border-gray-200 border-b-0 rounded-t-xl px-2 py-1.5 bg-gray-50">
                {['B', 'I', 'U', 'H2', 'H3', '• List', '1. List'].map(tool => (
                  <button
                    key={tool}
                    type="button"
                    className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                    title={tool}
                  >
                    {tool}
                  </button>
                ))}
              </div>
              <textarea
                rows={14}
                placeholder="Tulis isi berita di sini..."
                value={form.konten}
                onChange={set('konten')}
                className="w-full border border-gray-200 rounded-b-xl rounded-t-none px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono"
              />
              <p className="text-xs text-gray-400">{form.konten.length} karakter</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar settings */}
      <div className="flex flex-col gap-4">
        {/* Publikasi */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Publikasi</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))}
                className="w-4 h-4 rounded text-green-600"
              />
              <span className="text-sm text-gray-700">📌 Pinned (tampil di atas)</span>
            </label>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
              <Button variant="outline" onClick={() => handleSave(false)} loading={loading} fullWidth>
                💾 Simpan Draft
              </Button>
              <Button onClick={() => handleSave(true)} loading={loading} fullWidth>
                🚀 Publikasikan
              </Button>
            </div>
          </div>
        </div>

        {/* Kategori & Tags */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Kategori & Tag</h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Kategori</label>
              <select
                value={form.kategori}
                onChange={set('kategori')}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Pilih Kategori --</option>
                {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <Input
              label="Tags"
              placeholder="contoh: desa, posyandu, bantuan"
              hint="Pisahkan dengan koma"
              value={form.tagsInput}
              onChange={set('tagsInput')}
            />
          </div>
        </div>

        {/* Batal */}
        <Button variant="ghost" onClick={() => router.back()} fullWidth>
          ← Kembali
        </Button>
      </div>
    </div>
  )
}