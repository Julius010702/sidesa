// app/(admin)/admin/bansos/tambah/page.tsx
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
    setError('')
    try {
      const res = await fetch(`/api/penduduk?q=${nikSearch}&limit=1`)
      const data = await res.json()
      if (data.data?.[0]) setPenduduk(data.data[0])
      else setError('Penduduk tidak ditemukan dengan NIK/nama tersebut')
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
          <Link href="/admin/bansos" className="hover:text-gray-800 transition-colors">Bansos</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">Tambah</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Penerima Bansos</h1>
        <p className="text-sm text-gray-600 mt-0.5">Daftarkan penduduk sebagai penerima bantuan sosial</p>
      </div>

      <div className="max-w-xl space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-800">
            ⚠️ {error}
          </div>
        )}

        {/* Cari Penduduk */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800">🔍 Cari Penduduk</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <input
                value={nikSearch}
                onChange={(e) => { setNikSearch(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && cariPenduduk()}
                placeholder="Masukkan NIK atau nama penduduk..."
                className={inputCls}
              />
              <button
                onClick={cariPenduduk}
                disabled={cariLoading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap shadow-sm"
              >
                {cariLoading ? '⏳' : 'Cari'}
              </button>
            </div>

            {penduduk ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-sm font-bold text-green-800 shrink-0">
                  {penduduk.nama.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{penduduk.nama}</p>
                  <p className="text-xs font-mono text-gray-600 mt-0.5">{penduduk.nik}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{penduduk.alamat}</p>
                </div>
                <button
                  onClick={() => setPenduduk(null)}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>
            ) : (
              <p className="text-xs font-medium text-gray-500 text-center py-2">
                Belum ada penduduk dipilih — cari berdasarkan NIK atau nama
              </p>
            )}
          </div>
        </div>

        {/* Form Bansos */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800">📋 Data Bantuan Sosial</h2>
          </div>
          <div className="p-5 space-y-4">
            <InputField label="Jenis Bantuan" required>
              <select
                value={form.jenisBansos}
                onChange={(e) => setForm({ ...form, jenisBansos: e.target.value })}
                className={inputCls}
              >
                {jenisBansosOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </InputField>

            <div className="grid grid-cols-2 gap-3">
              <InputField label="Tahun" required>
                <input
                  type="number"
                  value={form.tahun}
                  onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                  className={inputCls}
                />
              </InputField>
              <InputField label="Nominal (Rp)">
                <input
                  type="number"
                  value={form.nominal}
                  onChange={(e) => setForm({ ...form, nominal: e.target.value })}
                  placeholder="Opsional"
                  className={inputCls}
                />
              </InputField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField label="Tanggal Mulai">
                <input
                  type="date"
                  value={form.tanggalMulai}
                  onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                  className={inputCls}
                />
              </InputField>
              <InputField label="Tanggal Akhir">
                <input
                  type="date"
                  value={form.tanggalAkhir}
                  onChange={(e) => setForm({ ...form, tanggalAkhir: e.target.value })}
                  className={inputCls}
                />
              </InputField>
            </div>

            <InputField label="Keterangan">
              <textarea
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                rows={3}
                placeholder="Catatan tambahan (opsional)..."
                className={`${inputCls} resize-none`}
              />
            </InputField>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || !penduduk}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : '💾 Simpan Data Bansos'}
          </button>
          <Link
            href="/admin/bansos"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
        </div>
      </div>
    </div>
  )
}