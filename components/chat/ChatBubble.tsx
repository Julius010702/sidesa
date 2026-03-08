'use client'

import { useState } from 'react'
import { formatTanggalJam } from '@/lib/utils'

export type MessageType = 'text' | 'image' | 'voice'

export interface Message {
  id: string
  pesan: string
  tipe: MessageType
  mediaUrl?: string | null
  isFromAdmin: boolean
  isRead: boolean
  createdAt: string
}

interface ChatBubbleProps {
  msg: Message
  isSelf: boolean
  senderLabel?: string
  onDelete?: (id: string) => Promise<void>
  deleteLabel?: string
}

export function ChatBubble({ msg, isSelf, senderLabel, onDelete, deleteLabel = 'Hapus pesan?' }: ChatBubbleProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    try { await onDelete(msg.id) }
    finally { setDeleting(false); setShowConfirm(false) }
  }

  const isGif = msg.mediaUrl?.toLowerCase().includes('.gif') ||
                msg.mediaUrl?.toLowerCase().includes('f_gif')

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} group relative`}>

      {onDelete && (
        <div className={`flex items-center ${isSelf ? 'order-first mr-1' : 'order-last ml-1'}`}>
          <button
            onClick={() => setShowConfirm((v) => !v)}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500"
            title="Hapus pesan"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      <div
        className={`rounded-2xl px-3 py-2 relative ${isSelf ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'} ${deleting ? 'opacity-40' : ''}`}
        style={{ maxWidth: 'min(85%, 380px)' }}
      >
        {!isSelf && senderLabel && (
          <p className="text-xs font-semibold text-blue-600 mb-1">{senderLabel}</p>
        )}

        {/* TEXT */}
        {msg.tipe === 'text' && (
          <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.pesan}</p>
        )}

        {/* IMAGE / GIF / STIKER */}
        {msg.tipe === 'image' && msg.mediaUrl && (
          <div className="flex flex-col gap-1.5">
            <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
              {isGif ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={msg.mediaUrl}
                  alt="stiker"
                  className="max-w-40 max-h-40 rounded-xl"
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={msg.mediaUrl}
                  alt="gambar"
                  className="w-48 h-36 object-cover rounded-xl hover:opacity-90 transition-opacity"
                />
              )}
            </a>
            {msg.pesan && (
              <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.pesan}</p>
            )}
          </div>
        )}

        {/* VOICE NOTE */}
        {msg.tipe === 'voice' && msg.mediaUrl && (
          <div className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${isSelf ? 'bg-blue-700' : 'bg-gray-200'}`}>
            <svg className={`w-4 h-4 shrink-0 ${isSelf ? 'text-blue-200' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 9v-2a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7v2h-3v2h8v-2h-3z" />
            </svg>
            <audio controls src={msg.mediaUrl} className="h-8"
              style={{ width: 'min(160px, 50vw)', filter: isSelf ? 'invert(0.7)' : 'none' }} />
          </div>
        )}

        <p className={`text-xs mt-1 ${isSelf ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
          {formatTanggalJam(msg.createdAt)}
          {isSelf && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
        </p>
      </div>

      {showConfirm && onDelete && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowConfirm(false)} />
          <div className={`absolute z-20 top-0 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 whitespace-nowrap ${isSelf ? 'right-8' : 'left-8'}`}>
            <span className="text-xs text-gray-600">{deleteLabel}</span>
            <button onClick={handleDelete} disabled={deleting} className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50">
              {deleting ? '...' : 'Hapus'}
            </button>
            <button onClick={() => setShowConfirm(false)} className="text-xs text-gray-400 hover:text-gray-600">
              Batal
            </button>
          </div>
        </>
      )}
    </div>
  )
}