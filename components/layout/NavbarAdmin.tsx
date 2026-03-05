'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

interface Notifikasi {
  id: string
  judul: string
  pesan: string
  tipe: string
  status: 'BELUM_DIBACA' | 'SUDAH_DIBACA'
  createdAt: string
}

interface NavbarAdminProps {
  userName?: string
  userRole?: Role
  /** Slot untuk tombol aksi tambahan, misal tombol stats di dashboard */
  actions?: React.ReactNode
}

export default function NavbarAdmin({
  userName = 'Admin Desa',
  userRole = 'ADMIN_DESA',
  actions,
}: NavbarAdminProps) {
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notifikasi[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/notifikasi?limit=5')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setNotifs(d.data ?? [])
          setUnreadCount(d.data?.filter((n: Notifikasi) => n.status === 'BELUM_DIBACA').length ?? 0)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleMarkAllRead() {
    await fetch('/api/notifikasi/read-all', { method: 'PATCH' }).catch(() => {})
    setUnreadCount(0)
    setNotifs((prev) => prev.map((n) => ({ ...n, status: 'SUDAH_DIBACA' as const })))
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      setIsLoggingOut(false)
    }
  }

  const roleLabel = userRole.replace(/_/g, ' ')

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-5 gap-3 sticky top-0 z-20 shadow-sm">

      {/* Kiri: slot actions (tombol stats dashboard, dll) */}
      <div className="flex-1 flex items-center gap-2 min-w-0 overflow-x-auto">
        {actions}
      </div>

      {/* Kanan: notifikasi + profil */}
      <div className="flex items-center gap-1.5 shrink-0">

        {/* Notifikasi */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false) }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-800">Notifikasi</p>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifs.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-xs">
                    <div className="text-3xl mb-2">🔔</div>
                    Tidak ada notifikasi
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 text-sm hover:bg-gray-50 transition-colors',
                        n.status === 'BELUM_DIBACA' && 'bg-blue-50/40'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {n.status === 'BELUM_DIBACA' && (
                          <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                        )}
                        <div className={cn(n.status === 'SUDAH_DIBACA' && 'pl-3.5')}>
                          <p className="font-medium text-gray-800 text-xs leading-snug">{n.judul}</p>
                          <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{n.pesan}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(n.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/50">
                <Link
                  href="/admin/notifikasi"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setNotifOpen(false)}
                >
                  Lihat semua notifikasi →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profil admin */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false) }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-xs">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight truncate max-w-32">
                {userName}
              </p>
              <p className="text-xs text-gray-400 leading-tight">{roleLabel}</p>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
                  <p className="text-xs text-gray-400">{roleLabel}</p>
                </div>
              </div>
              <div className="py-1.5">
                <Link
                  href="/admin/pengaturan"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Pengaturan
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Lihat Portal Desa
                </Link>
              </div>
              <div className="border-t border-gray-50 py-1.5">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isLoggingOut ? 'Keluar...' : 'Keluar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}