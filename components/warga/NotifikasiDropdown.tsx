'use client'

import { useEffect, useRef, useState } from 'react'
import { formatTanggalJam } from '@/lib/utils'

interface Notifikasi {
  id: string
  judul: string
  pesan: string
  tipe: string
  status: string
  createdAt: string
}

export default function NotifikasiDropdown() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notifikasi[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifs = () => {
    fetch('/api/notifikasi?limit=10')
      .then((r) => r.json())
      .then((d) => { if (d.success) { setNotifs(d.data); setUnread(d.unreadCount) } })
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifikasi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'read_all' }) })
    fetchNotifs()
  }

  const markRead = async (id: string) => {
    await fetch(`/api/notifikasi/${id}`, { method: 'PATCH' })
    fetchNotifs()
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifikasi</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Tidak ada notifikasi</div>
            ) : (
              notifs.map((n) => (
                <button key={n.id} onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${n.status === 'BELUM_DIBACA' ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.status === 'BELUM_DIBACA' ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800">{n.judul}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.pesan}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTanggalJam(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
