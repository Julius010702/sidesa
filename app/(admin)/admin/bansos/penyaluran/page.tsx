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

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Link href="/admin/dashboard" className="hover:text-gray-600">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/bansos" className="hover:text-gray-600">Bansos</Link>
          <span>/</span>
          <span className="text-gray-600">Catat Penyaluran</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Catat Penyaluran Bansos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Form */}
        <div className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">✓ {success}</div>}

          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Form Penyaluran</p>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Penerima Bansos</label>
              <select value={form.bansosId} onChange={(e) => setForm({ ...form, bansosId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">-- Pilih Penerima --</option>
                {bansosOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.penduduk.nama} — {b.jenisBansos} {b.tahun}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Tanggal Penyaluran</label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Nominal (Rp)</label>
              <input type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })}
                placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Keterangan</label>
              <input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                placeholder="Opsional..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Menyimpan...' : 'Catat Penyaluran'}
            </button>
          </div>
        </div>

        {/* Riwayat */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Riwayat Penyaluran Terbaru</p>
          {riwayat.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada riwayat penyaluran</p>
          ) : (
            <div className="space-y-3">
              {riwayat.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{p.bansos.penduduk.nama}</p>
                    <p className="text-xs text-gray-400">{p.bansos.jenisBansos} · {formatTanggal(p.tanggal)}</p>
                  </div>
                  <span className="text-sm font-bold text-green-700">
                    Rp {p.nominal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
