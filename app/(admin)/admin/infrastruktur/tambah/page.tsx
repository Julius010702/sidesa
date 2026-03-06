'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeaderPage from '@/components/layout/HeaderPage'

const kondisiOptions = ['BAIK', 'SEDANG', 'RUSAK', 'RUSAK_BERAT']

export default function TambahInfrastrukturPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [error, setError] = useState('')
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nama: '',
    kategori: '',
    lokasi: '',
    deskripsi: '',
    kondisi: 'BAIK',
    status: 'Aktif',
    catatan: '',
    foto: '',
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
      formData.append('folder', 'infrastruktur')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.success && data.url) {
        setForm((f) => ({ ...f, foto: data.url }))
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
    setForm((f) => ({ ...f, foto: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!form.nama.trim()) { setError('Nama infrastruktur wajib diisi'); return }
    if (!form.kategori.trim()) { setError('Kategori wajib diisi'); return }
    if (!form.lokasi.trim()) { setError('Lokasi wajib diisi'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/infrastruktur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          foto: form.foto || null,
          deskripsi: form.deskripsi || null,
          catatan: form.catatan || null,
        }),
      })
      const data = await res.json()

      if (data.success) {
        router.push('/admin/infrastruktur')
      } else {
        setError(data.error ?? 'Gagal menyimpan data')
      }
    } catch {
      setError('Terjadi kesalahan koneksi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <HeaderPage
        title="Tambah Aset Infrastruktur"
        subtitle="Tambahkan data infrastruktur atau aset desa baru"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Infrastruktur', href: '/admin/infrastruktur' },
          { label: 'Tambah' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Upload foto */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {previewFoto ? (
              <div className="relative group">
                <Image
                  src={previewFoto}
                  alt="Preview foto"
                  width={800}
                  height={300}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {uploadingFoto ? (
                    <span className="bg-white text-gray-700 text-xs px-4 py-2 rounded-xl font-medium shadow">
                      ⏳ Mengupload...
                    </span>
                  ) : (
                    <>
                      <label className="bg-white text-blue-600 text-xs px-4 py-2 rounded-xl font-semibold shadow cursor-pointer hover:bg-blue-50 transition-colors">
                        📷 Ganti Foto
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} />
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
                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-lg">
                  Hover foto untuk ganti
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Form fields */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Infrastruktur</p>

            {/* Nama */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Nama Infrastruktur <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Jalan Desa RT 01, Balai Desa..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Kategori & Kondisi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  placeholder="Contoh: Jalan, Gedung, Jembatan..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Kondisi</label>
                <select
                  value={form.kondisi}
                  onChange={(e) => setForm({ ...form, kondisi: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {kondisiOptions.map((k) => (
                    <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                placeholder="Contoh: RT 01 RW 02, Dusun Cijambe..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <input
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                placeholder="Contoh: Aktif, Tidak Aktif, Dalam Perbaikan..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi</label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={3}
                placeholder="Deskripsi singkat tentang infrastruktur ini..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Catatan</label>
              <textarea
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                rows={2}
                placeholder="Catatan tambahan jika ada..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Sidebar aksi */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Aksi</p>
            <div className="space-y-2">
              <button
                onClick={handleSubmit}
                disabled={loading || uploadingFoto}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : '💾 Simpan Aset'}
              </button>
              <Link
                href="/admin/infrastruktur"
                className="block text-center py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
            </div>
          </div>

          {/* Info kondisi */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">ℹ️ Panduan Kondisi</p>
            <div className="space-y-1.5">
              {[
                { k: 'BAIK', desc: 'Berfungsi normal, tidak ada kerusakan' },
                { k: 'SEDANG', desc: 'Ada kerusakan kecil, masih berfungsi' },
                { k: 'RUSAK', desc: 'Kerusakan signifikan, perlu perbaikan' },
                { k: 'RUSAK BERAT', desc: 'Tidak berfungsi, butuh renovasi' },
              ].map((item) => (
                <div key={item.k} className="flex gap-2">
                  <span className="text-xs font-bold text-blue-600 w-20 shrink-0">{item.k}</span>
                  <span className="text-xs text-blue-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}