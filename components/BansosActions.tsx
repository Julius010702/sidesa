'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BansosActionsProps {
  id: string
  status: string
  namaPenerima: string
}

export default function BansosActions({ id, status, namaPenerima }: BansosActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showHapus, setShowHapus] = useState(false)

  async function handleToggleStatus() {
    setLoading(true)
    const newStatus = status === 'AKTIF' ? 'TIDAK_AKTIF' : 'AKTIF'
    try {
      const res = await fetch(`/api/bansos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal mengubah status')
      }
    } catch {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  async function handleHapus() {
    setLoading(true)
    try {
      const res = await fetch(`/api/bansos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus bansos')
      }
    } catch {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
      setShowHapus(false)
    }
  }

  const isAktif = status === 'AKTIF'

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {/* Toggle Aktif / Nonaktif */}
        {isAktif ? (
          <button
            onClick={handleToggleStatus}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Nonaktifkan</span>
          </button>
        ) : (
          <button
            onClick={handleToggleStatus}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Aktifkan</span>
          </button>
        )}

        {/* Hapus */}
        <button
          onClick={() => setShowHapus(true)}
          disabled={loading}
          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline">Hapus</span>
        </button>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showHapus && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !loading && setShowHapus(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-50 border-b border-red-100 px-6 py-5 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Hapus Data Bansos?</h3>
              <p className="text-sm text-gray-500 mt-1">Tindakan ini tidak dapat dibatalkan</p>
            </div>
            <div className="px-6 py-5">
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold text-red-700 shrink-0">
                  {namaPenerima.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{namaPenerima}</p>
                  <p className="text-xs text-gray-500 mt-0.5">data bansos akan dihapus permanen</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowHapus(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleHapus}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menghapus...
                    </>
                  ) : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}