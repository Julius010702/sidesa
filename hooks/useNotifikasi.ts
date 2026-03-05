'use client'

import { useEffect, useState, useCallback } from 'react'

export interface Notifikasi {
  id: string
  judul: string
  pesan: string
  tipe: string
  refId?: string | null
  status: 'BELUM_DIBACA' | 'SUDAH_DIBACA'
  createdAt: string
}

export function useNotifikasi() {
  const [data, setData] = useState<Notifikasi[]>([])
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/notifikasi')
      if (!res.ok) return
      const json = await res.json()
      setData(json.data ?? json)
    } catch {
      // silent fail — notifikasi bukan fitur kritis
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
    // polling setiap 30 detik
    const interval = setInterval(fetch_, 30_000)
    return () => clearInterval(interval)
  }, [fetch_])

  const tandaiBaca = async (id: string) => {
    await fetch(`/api/notifikasi/${id}`, { method: 'PATCH' })
    setData(prev =>
      prev.map(n => n.id === id ? { ...n, status: 'SUDAH_DIBACA' } : n)
    )
  }

  const tandaiSemuaBaca = async () => {
    await fetch('/api/notifikasi', { method: 'PATCH' })
    setData(prev => prev.map(n => ({ ...n, status: 'SUDAH_DIBACA' })))
  }

  const belumDibaca = data.filter(n => n.status === 'BELUM_DIBACA').length

  return { data, loading, belumDibaca, tandaiBaca, tandaiSemuaBaca, refetch: fetch_ }
}