'use client'

import { useEffect, useState } from 'react'
import { formatTanggal, getStatusColor, getStatusLabel } from '@/lib/utils'

interface Bansos {
  id: string
  jenisBansos: string
  status: string
  tahun: number
  nominal: number | null
  keterangan: string | null
  tanggalMulai: string | null
  tanggalAkhir: string | null
  createdAt: string
  penyaluran: { id: string; tanggal: string; nominal: number; keterangan: string | null }[]
}

const jenisBansosIcon: Record<string, string> = {
  PKH: '👨‍👩‍👧',
  BLT: '💵',
  BPNT: '🛒',
  KIP: '🎓',
  LAINNYA: '📋',
}

export default function WargaBansosPage() {
  const [bansos, setBansos] = useState<Bansos[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bansos?mine=true')
      .then((r) => r.json())
      .then((d) => { if (d.success) setBansos(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const totalNominal = bansos
    .filter((b) => b.status === 'AKTIF')
    .reduce((sum, b) => sum + (b.nominal ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Bantuan Sosial Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Informasi bantuan sosial yang Anda terima</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : bansos.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">Belum ada data bantuan sosial</p>
          <p className="text-sm text-gray-400 mt-1">Hubungi kantor desa jika Anda merasa berhak mendapat bantuan</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          {totalNominal > 0 && (
            <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
              <p className="text-sm font-medium text-green-100">Total Bantuan Aktif</p>
              <p className="text-3xl font-bold mt-1">
                Rp {totalNominal.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-green-200 mt-1">per periode</p>
            </div>
          )}

          {/* List */}
          <div className="space-y-4">
            {bansos.map((b) => (
              <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                      {jenisBansosIcon[b.jenisBansos] ?? '📋'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{getStatusLabel(b.jenisBansos)}</h3>
                      <p className="text-xs text-gray-400">Tahun {b.tahun}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(b.status)}`}>
                    {getStatusLabel(b.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  {b.nominal && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400">Nominal</p>
                      <p className="font-semibold text-gray-800 mt-0.5">
                        Rp {b.nominal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                  {b.tanggalMulai && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400">Periode</p>
                      <p className="font-semibold text-gray-800 mt-0.5">
                        {formatTanggal(b.tanggalMulai)}
                        {b.tanggalAkhir && ` – ${formatTanggal(b.tanggalAkhir)}`}
                      </p>
                    </div>
                  )}
                </div>

                {b.keterangan && (
                  <p className="mt-3 text-xs text-gray-500 bg-yellow-50 rounded-lg px-3 py-2">
                    📝 {b.keterangan}
                  </p>
                )}

                {/* Riwayat penyaluran */}
                {b.penyaluran.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Riwayat Penyaluran
                    </p>
                    <div className="space-y-2">
                      {b.penyaluran.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{formatTanggal(p.tanggal)}</span>
                          <span className="font-semibold text-green-700">
                            + Rp {p.nominal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}