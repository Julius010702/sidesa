'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatBubble, type Message } from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'

interface ChatUser {
  userId: string
  nama: string
  lastMessage: string
  lastTime: string
  unread: number
}

export default function AdminChatPage() {
  const [users, setUsers] = useState<ChatUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchUsers = async () => {
    const res = await fetch('/api/chat/users')
    const d = await res.json()
    if (d.success) setUsers(d.data)
  }

  const fetchMessages = async (userId: string) => {
    const res = await fetch(`/api/chat?userId=${userId}`)
    const d = await res.json()
    if (d.success) setMessages(d.data)
  }

  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!selectedUser) return
    const userId = selectedUser.userId
    fetchMessages(userId)
    const interval = setInterval(() => fetchMessages(userId), 3000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.userId])

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
    if (!selectedUser) return
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesan, tipe: 'text', targetUserId: selectedUser.userId }),
    })
    fetchMessages(selectedUser.userId)
  }

  const handleSendImage = async (file: File, caption?: string) => {
    if (!selectedUser) return
    try {
      const mediaUrl = await uploadFile(file)
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesan: caption || '', tipe: 'image', mediaUrl, targetUserId: selectedUser.userId }),
      })
      fetchMessages(selectedUser.userId)
    } catch (e) {
      console.error('Gagal kirim gambar:', e)
      alert('Gagal mengirim gambar. Coba lagi.')
    }
  }

  const handleSendVoice = async (blob: Blob) => {
    if (!selectedUser) return
    try {
      const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'mp4' : 'webm'
      const mediaUrl = await uploadFile(blob, `voice-${Date.now()}.${ext}`)
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesan: '', tipe: 'voice', mediaUrl, targetUserId: selectedUser.userId }),
      })
      fetchMessages(selectedUser.userId)
    } catch (e) {
      console.error('Gagal kirim voice:', e)
      alert('Gagal mengirim voice note. Coba lagi.')
    }
  }

  const handleSelectUser = (u: ChatUser) => {
    setSelectedUser(u)
    setShowSidebar(false) // Mobile: pindah ke chat view
  }

  return (
    // Gunakan 100dvh untuk support mobile browser chrome bar
    <div className="flex w-full overflow-hidden" style={{ height: 'calc(100dvh - 7rem)' }}>

      {/* ── Sidebar ── */}
      <div className={`
        ${showSidebar ? 'flex' : 'hidden'} md:flex
        flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shrink-0
        w-full md:w-64 lg:w-72
      `}>
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900 text-sm">Pesan Masuk</h2>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} percakapan</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-0">
          {users.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">Belum ada pesan</div>
          ) : (
            users.map(u => (
              <button
                key={u.userId}
                onClick={() => handleSelectUser(u)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedUser?.userId === u.userId ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                    {u.nama.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-gray-800 truncate">{u.nama}</p>
                      {u.unread > 0 && (
                        <span className="shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                          {u.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{u.lastMessage || '📎 Media'}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className={`
        ${!showSidebar ? 'flex' : 'hidden'} md:flex
        flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden flex-1 min-w-0
        md:ml-4
      `}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
              {/* Tombol back untuk mobile */}
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                {selectedUser.nama.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{selectedUser.nama}</p>
                <p className="text-xs text-green-500">● Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm">Belum ada pesan dengan {selectedUser.nama}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map(msg => (
                    <ChatBubble
                      key={msg.id}
                      msg={msg}
                      isSelf={msg.isFromAdmin}
                      senderLabel={selectedUser.nama}
                    />
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-gray-100 shrink-0">
              <ChatInput
                onSendText={handleSendText}
                onSendImage={handleSendImage}
                onSendVoice={handleSendVoice}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-gray-500 font-medium text-sm">Pilih percakapan</p>
            <p className="text-xs text-gray-400 mt-1">Klik nama warga untuk memulai</p>
          </div>
        )}
      </div>
    </div>
  )
}