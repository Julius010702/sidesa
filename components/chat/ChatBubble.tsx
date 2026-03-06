'use client'

import Image from 'next/image'
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
}

export function ChatBubble({ msg, isSelf, senderLabel }: ChatBubbleProps) {
  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          rounded-2xl px-3 py-2
          ${isSelf ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}
        `}
        // max-w-[85%] untuk mobile agar tidak overflow, 75% untuk desktop
        style={{ maxWidth: 'min(85%, 380px)' }}
      >
        {!isSelf && senderLabel && (
          <p className="text-xs font-semibold text-blue-600 mb-1">{senderLabel}</p>
        )}

        {/* TEXT */}
        {msg.tipe === 'text' && (
          <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.pesan}</p>
        )}

        {/* IMAGE */}
        {msg.tipe === 'image' && msg.mediaUrl && (
          <div className="flex flex-col gap-1.5">
            <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
              <div className="relative w-48 h-36 rounded-xl overflow-hidden">
                <Image
                  src={msg.mediaUrl}
                  alt="gambar"
                  fill
                  className="object-cover hover:opacity-90 transition-opacity"
                  sizes="192px"
                />
              </div>
            </a>
            {msg.pesan && (
              <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.pesan}</p>
            )}
          </div>
        )}

        {/* VOICE NOTE */}
        {msg.tipe === 'voice' && msg.mediaUrl && (
          <div className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${isSelf ? 'bg-blue-700' : 'bg-gray-200'}`}>
            <svg
              className={`w-4 h-4 shrink-0 ${isSelf ? 'text-blue-200' : 'text-gray-500'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 9v-2a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7v2h-3v2h8v-2h-3z" />
            </svg>
            <audio
              controls
              src={msg.mediaUrl}
              className="h-8"
              style={{
                width: 'min(160px, 50vw)',
                filter: isSelf ? 'invert(0.7)' : 'none',
              }}
            />
          </div>
        )}

        <p className={`text-xs mt-1 ${isSelf ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
          {formatTanggalJam(msg.createdAt)}
          {isSelf && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
        </p>
      </div>
    </div>
  )
}