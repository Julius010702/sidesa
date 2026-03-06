// app/(admin)/admin/bansos/penyaluran/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatTanggal } from '@/lib/utils'

interface BansosOption {
  id: string
  jenisBansos: string
  tahun: number
  penduduk: { nama: string; nik: string }
}

interface Penyaluran {
  id: string
  tanggal: string
  nominal: number
  keterangan: string | null
  bansos: { jenisBansos: string; penduduk: { nama: string } }
}

export default function PenyaluranPage() {
  const [bansosOptions, setBansosOptions] = useState<BansosOption[]>([])
  const [riwayat, setRiwayat] = useState<Penyaluran[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    bansosId: '',
    tanggal: new Date().toISOString().split('T')[0],
    nominal: '',
    keterangan: '',
  })

  useEffect(() => {
    fetch('/api/bansos?status=AKTIF&limit=100')
      .then((r) => r.json())
      .then((d) => { if (d.success) setBansosOptions(d.data) })
    fetch('/api/penyaluran?limit=10')
      .then((r) => r.json())
      .then((d) => { if (d.success) setRiwayat(d.data) })
  }, [success])

  const handleSubmit = async () => {
    if (!form.bansosId || !form.nominal) { setError('Bansos dan nominal wajib diisi'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/penyaluran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bansosId: form.bansosId,
          tanggal: form.tanggal,
          nominal: parseFloat(form.nominal),
          keterangan: form.keterangan || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Penyaluran berhasil dicatat!')
        setForm({ bansosId: '', tanggal: new Date().toISOString().split('T')[0], nominal: '', keterangan: '' })
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error ?? 'Gagal menyimpan')
      }
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

  return (
    <div>
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
          <Link href="/admin/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <span className="text-gray-300">/</span>
          <Link href="/admin/bansos" className="hover:text-gray-800 transition-colors">Bansos</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">Catat Penyaluran</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Catat Penyaluran Bansos</h1>
        <p className="text-sm text-gray-600 mt-0.5">Rekam distribusi bantuan sosial kepada penerima</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Form */}
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-800">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium text-green-800">
              ✅ {success}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">📋 Form Penyaluran</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Penerima Bansos <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.bansosId}
                  onChange={(e) => setForm({ ...form, bansosId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">-- Pilih Penerima --</option>
                  {bansosOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.penduduk.nama} — {b.jenisBansos} {b.tahun}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tanggal Penyaluran <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nominal (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.nominal}
                  onChange={(e) => setForm({ ...form, nominal: e.target.value })}
                  placeholder="Contoh: 300000"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Keterangan</label>
                <input
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  placeholder="Opsional..."
                  className={inputCls}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : '💾 Catat Penyaluran'}
              </button>
            </div>
          </div>
        </div>

        {/* Riwayat */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">🕒 Riwayat Penyaluran Terbaru</h2>
            <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2.5 py-1 rounded-full">
              {riwayat.length} data
            </span>
          </div>

          {riwayat.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-700 font-semibold">Belum ada riwayat penyaluran</p>
              <p className="text-gray-500 text-sm mt-1">Data akan muncul setelah penyaluran dicatat</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {riwayat.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-green-700 text-sm font-bold">Rp</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.bansos.penduduk.nama}</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">
                        {p.bansos.jenisBansos} · {formatTanggal(p.tanggal)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-3">
                    <span className="text-sm font-bold text-green-700">
                      Rp {p.nominal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}