'use client'

import { useEffect, useState, useCallback } from 'react'

export type StatusSurat = 'PENDING' | 'DIPROSES' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI'

export interface Surat {
  id: string
  nomorSurat?: string | null
  jenisSurat: string
  keperluan: string
  status: StatusSurat
  catatanAdmin?: string | null
  dokumenUrl?: string | null
  suratJadiUrl?: string | null
  tanggalDiajukan: string
  tanggalSelesai?: string | null
  user: { nama: string; nik: string }
}

interface UseSuratOptions {
  status?: StatusSurat
  page?: number
  perPage?: number
}

export function useSurat(options: UseSuratOptions = {}) {
  const [data, setData] = useState<Surat[]>([])
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

      const res = await fetch(`/api/surat?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data surat')
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

  const ajukan = async (payload: { jenisSurat: string; keperluan: string }) => {
    const res = await fetch('/api/surat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Gagal mengajukan surat')
    }
    await fetch_()
    return res.json()
  }

  return { data, loading, error, totalPages, total, refetch: fetch_, ajukan }
}

export function useSuratDetail(id: string) {
  const [data, setData] = useState<Surat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/surat/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .finally(() => setLoading(false))
  }, [id])

  return { data, loading }
}