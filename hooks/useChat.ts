'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  pesan: string
  isFromAdmin: boolean
  isRead: boolean
  createdAt: string
  user: { nama: string }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/chat')
      if (!res.ok) return
      const json = await res.json()
      setMessages(json.data ?? json)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
    // polling setiap 5 detik untuk real-time feel
    const interval = setInterval(fetch_, 5_000)
    return () => clearInterval(interval)
  }, [fetch_])

  // auto scroll ke bawah saat pesan baru masuk
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const kirim = async (pesan: string) => {
    if (!pesan.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesan }),
      })
      if (!res.ok) throw new Error('Gagal mengirim pesan')
      await fetch_()
    } finally {
      setSending(false)
    }
  }

  return { messages, loading, sending, kirim, bottomRef, refetch: fetch_ }
}