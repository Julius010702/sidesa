'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const jenisBansosOptions = [
  { value: 'PKH', label: 'PKH - Program Keluarga Harapan' },
  { value: 'BLT', label: 'BLT - Bantuan Langsung Tunai' },
  { value: 'BPNT', label: 'BPNT - Bantuan Pangan Non Tunai' },
  { value: 'KIP', label: 'KIP - Kartu Indonesia Pintar' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

export default function TambahBansosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nikSearch, setNikSearch] = useState('')
  const [penduduk, setPenduduk] = useState<{ id: string; nama: string; nik: string; alamat: string } | null>(null)
  const [cariLoading, setCariLoading] = useState(false)

  const [form, setForm] = useState({
    jenisBansos: 'PKH',
    tahun: new Date().getFullYear().toString(),
    nominal: '',
    keterangan: '',
    tanggalMulai: '',
    tanggalAkhir: '',
  })

  const cariPenduduk = async () => {
    if (!nikSearch.trim()) return
    setCariLoading(true)
    setPenduduk(null)
    try {
      const res = await fetch(`/api/penduduk?q=${nikSearch}&limit=1`)
      const data = await res.json()
      if (data.data?.[0]) setPenduduk(data.data[0])
      else setError('Penduduk tidak ditemukan')
    } finally {
      setCariLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!penduduk) { setError('Pilih penduduk terlebih dahulu'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bansos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendudukId: penduduk.id,
          jenisBansos: form.jenisBansos,
          tahun: parseInt(form.tahun),
          nominal: form.nominal ? parseFloat(form.nominal) : undefined,
          keterangan: form.keterangan || undefined,
          tanggalMulai: form.tanggalMulai || undefined,
          tanggalAkhir: form.tanggalAkhir || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) router.push('/admin/bansos')
      else setError(data.error ?? 'Gagal menyimpan')
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Link href="/admin/dashboard" className="hover:text-gray-600">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/bansos" className="hover:text-gray-600">Bansos</Link>
          <span>/</span>
          <span className="text-gray-600">Tambah</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Penerima Bansos</h1>
      </div>

      <div className="max-w-xl space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Cari Penduduk */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cari Penduduk</p>
          <div className="flex gap-2">
            <input
              value={nikSearch}
              onChange={(e) => { setNikSearch(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && cariPenduduk()}
              placeholder="Masukkan NIK atau nama..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={cariPenduduk} disabled={cariLoading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              {cariLoading ? '...' : 'Cari'}
            </button>
          </div>
          {penduduk && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                {penduduk.nama.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{penduduk.nama}</p>
                <p className="text-xs text-gray-500 font-mono">{penduduk.nik}</p>
              </div>
              <button onClick={() => setPenduduk(null)} className="ml-auto text-gray-400 hover:text-red-500">✕</button>
            </div>
          )}
        </div>

        {/* Form Bansos */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Bansos</p>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Jenis Bantuan</label>
            <select value={form.jenisBansos} onChange={(e) => setForm({ ...form, jenisBansos: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {jenisBansosOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Tahun</label>
              <input type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Nominal (Rp)</label>
              <input type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })}
                placeholder="Opsional" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Tanggal Mulai</label>
              <input type="date" value={form.tanggalMulai} onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Tanggal Akhir</label>
              <input type="date" value={form.tanggalAkhir} onChange={(e) => setForm({ ...form, tanggalAkhir: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Keterangan</label>
            <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              rows={3} placeholder="Opsional..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={loading || !penduduk}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Menyimpan...' : 'Simpan Data Bansos'}
          </button>
          <Link href="/admin/bansos" className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Batal
          </Link>
        </div>
      </div>
    </div>
  )
}
