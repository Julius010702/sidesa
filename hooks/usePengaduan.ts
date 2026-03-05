'use client'

import { useEffect, useState, useCallback } from 'react'

export type StatusPengaduan = 'DITERIMA' | 'DICEK' | 'DIPROSES' | 'SELESAI' | 'DITOLAK'

export interface Pengaduan {
  id: string
  judul: string
  deskripsi: string
  kategori: string
  lokasi: string
  fotoUrl?: string | null
  status: StatusPengaduan
  prioritas: number
  catatanAdmin?: string | null
  tanggalLapor: string
  tanggalSelesai?: string | null
  user: { nama: string }
}

interface UsePengaduanOptions {
  status?: StatusPengaduan
  page?: number
  perPage?: number
}

export function usePengaduan(options: UsePengaduanOptions = {}) {
  const [data, setData] = useState<Pengaduan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (options.status) params.set('status', options.status)
      if (options.page) params.set('page', String(options.page))
      if (options.perPage) params.set('perPage', String(options.perPage))

      const res = await fetch(`/api/pengaduan?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data pengaduan')
      const json = await res.json()
      setData(json.data ?? json)
      setTotalPages(json.totalPages ?? 1)
      setTotal(json.total ?? (json.data ?? json).length)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [options.status, options.page, options.perPage])

  useEffect(() => { fetch_() }, [fetch_])

  const buat = async (payload: {
    judul: string
    deskripsi: string
    kategori: string
    lokasi: string
  }) => {
    const res = await fetch('/api/pengaduan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Gagal mengirim pengaduan')
    }
    await fetch_()
    return res.json()
  }

  return { data, loading, error, totalPages, total, refetch: fetch_, buat }
}

export function usePengaduanDetail(id: string) {
  const [data, setData] = useState<Pengaduan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/pengaduan/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .finally(() => setLoading(false))
  }, [id])

  return { data, loading }
}