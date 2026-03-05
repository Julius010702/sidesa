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
    const load = () => { fetchUsers() }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!selectedUser) return
    const userId = selectedUser.userId
    const load = () => { fetchMessages(userId) }
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Upload helper ──────────────────────────────────────────
  const uploadFile = async (file: File | Blob, filename?: string): Promise<string> => {
    const form = new FormData()
    form.append('file', file, filename || 'file')
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) throw new Error('Gagal upload file')
    return (await res.json()).url as string
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
    const mediaUrl = await uploadFile(file)
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesan: caption || '', tipe: 'image', mediaUrl, targetUserId: selectedUser.userId }),
    })
    fetchMessages(selectedUser.userId)
  }

  const handleSendVoice = async (blob: Blob) => {
    if (!selectedUser) return
    const mediaUrl = await uploadFile(blob, `voice-${Date.now()}.webm`)
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesan: '', tipe: 'voice', mediaUrl, targetUserId: selectedUser.userId }),
    })
    fetchMessages(selectedUser.userId)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar warga */}
      <div className="w-72 bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden shrink-0">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Pesan Masuk</h2>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} percakapan</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {users.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">Belum ada pesan</div>
          ) : (
            users.map(u => (
              <button
                key={u.userId}
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedUser?.userId === u.userId ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                    {u.nama.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
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

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                {selectedUser.nama.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selectedUser.nama}</p>
                <p className="text-xs text-green-500">● Online</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                <span>Gambar · Kamera · Suara</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm">Belum ada pesan dengan {selectedUser.nama}</p>
                </div>
              ) : (
                messages.map(msg => (
                  <ChatBubble
                    key={msg.id}
                    msg={msg}
                    isSelf={msg.isFromAdmin}
                    senderLabel={selectedUser.nama}
                  />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 shrink-0">
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
            <p className="text-gray-500 font-medium">Pilih percakapan</p>
            <p className="text-sm text-gray-400 mt-1">Klik nama warga di sebelah kiri untuk memulai</p>
          </div>
        )}
      </div>
    </div>
  )
}