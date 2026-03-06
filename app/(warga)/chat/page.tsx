'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatBubble, type Message } from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'

export default function WargaChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat')
      const d = await res.json()
      if (d.success) setMessages(d.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Upload helper ──────────────────────────────────────────
  const uploadFile = async (file: File | Blob, filename?: string): Promise<string> => {
    const form = new FormData()
    const name = filename || (file instanceof File ? file.name : `file-${Date.now()}`)
    form.append('file', file, name)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Upload gagal: ${res.status} - ${errText}`)
    }
    const data = await res.json()
    if (!data.url) throw new Error('URL tidak ditemukan dalam response')
    return data.url as string
  }

  // ── Send handlers ──────────────────────────────────────────
  const handleSendText = async (pesan: string) => {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesan, tipe: 'text' }),
    })
    fetchMessages()
  }

  const handleSendImage = async (file: File, caption?: string) => {
    try {
      const mediaUrl = await uploadFile(file)
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesan: caption || '', tipe: 'image', mediaUrl }),
      })
      fetchMessages()
    } catch (e) {
      console.error('Gagal kirim gambar:', e)
      alert('Gagal mengirim gambar. Coba lagi.')
    }
  }

  const handleSendVoice = async (blob: Blob) => {
    try {
      const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'mp4' : 'webm'
      const mediaUrl = await uploadFile(blob, `voice-${Date.now()}.${ext}`)
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesan: '', tipe: 'voice', mediaUrl }),
      })
      fetchMessages()
    } catch (e) {
      console.error('Gagal kirim voice:', e)
      alert('Gagal mengirim voice note. Coba lagi.')
    }
  }

  return (
    // Gunakan fixed height dengan safe area untuk mobile
    <div className="flex flex-col w-full" style={{ height: 'calc(100dvh - 7rem)' }}>
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900 text-sm">Helpdesk Desa</h2>
          <p className="text-xs text-green-500 font-medium">● Online</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-gray-400">
          {/* Icon galeri */}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
          </svg>
          {/* Icon kamera */}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          {/* Icon mic */}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>

      {/* Messages — flex-1 dengan overflow-y scroll */}
      <div className="flex-1 overflow-y-auto bg-white border border-gray-100 rounded-2xl p-3 mb-3 min-h-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500 font-medium text-sm">Belum ada pesan</p>
            <p className="text-xs text-gray-400 mt-1">Kirim pesan, gambar, atau voice note</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map(msg => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                isSelf={!msg.isFromAdmin}
                senderLabel="Petugas Desa"
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input — shrink-0 agar tidak ikut scroll */}
      <div className="shrink-0 bg-white border border-gray-100 rounded-2xl p-3">
        <ChatInput
          onSendText={handleSendText}
          onSendImage={handleSendImage}
          onSendVoice={handleSendVoice}
        />
      </div>
    </div>
  )
}