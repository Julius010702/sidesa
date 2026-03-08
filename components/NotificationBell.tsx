'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Notifikasi {
  id: string
  judul: string
  pesan: string
  tipe: string
  refId: string | null
  isRead: boolean
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function getTipeIcon(tipe: string): string {
  switch (tipe) {
    case 'SURAT': return '📄'
    case 'PENGADUAN': return '📢'
    case 'BANSOS': return '🎁'
    default: return '🔔'
  }
}

function getTipeHref(tipe: string, refId: string | null, role?: string): string {
  const isAdmin = role && ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW'].includes(role)
  if (!refId) return isAdmin ? '/admin/dashboard' : '/dashboard'
  switch (tipe) {
    case 'SURAT': return isAdmin ? `/admin/surat/${refId}` : `/surat/${refId}`
    case 'PENGADUAN': return isAdmin ? `/admin/pengaduan/${refId}` : `/pengaduan/${refId}`
    default: return isAdmin ? '/admin/dashboard' : '/dashboard'
  }
}

interface NotificationBellProps {
  role?: string
}

export default function NotificationBell({ role }: NotificationBellProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notifikasi[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifikasi')
      const data = await res.json()
      if (data.success) {
        setNotifs(data.data)
        setUnreadCount(data.unreadCount)
      }
    } catch {
      // silent fail
    }
  }, [])

  // Poll setiap 30 detik untuk notif baru
  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleOpen() {
    setOpen((prev) => !prev)
    if (!open) {
      await fetchNotifs()
    }
  }

  async function handleMarkAll() {
    setLoading(true)
    try {
      await fetch('/api/notifikasi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  async function handleClick(notif: Notifikasi) {
    // Mark as read
    if (!notif.isRead) {
      await fetch('/api/notifikasi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id }),
      })
      setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    setOpen(false)
    router.push(getTipeHref(notif.tipe, notif.refId, role))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifikasi"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 text-sm">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={loading}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm text-gray-400 font-medium">Belum ada notifikasi</p>
              </div>
            ) : (
              notifs.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                    !notif.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {/* Icon */}
                  <span className="text-xl shrink-0 mt-0.5">{getTipeIcon(notif.tipe)}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-semibold leading-snug ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.judul}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.pesan}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  setOpen(false)
                  router.push(role && ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW'].includes(role)
                    ? '/admin/notifikasi'
                    : '/notifikasi')
                }}
                className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Lihat semua notifikasi →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}