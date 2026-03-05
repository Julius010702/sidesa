'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/surat',
    label: 'Pengajuan Surat',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/pengaduan',
    label: 'Pengaduan',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    href: '/bansos',
    label: 'Bantuan Sosial',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    href: '/profil',
    label: 'Profil Saya',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'Hubungi Desa',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
]

// ─── SidebarContent ─────────────────────────────────────────────────────────

interface SidebarContentProps {
  userName: string
  userNik?: string
  pathname: string
  onNavigate: () => void
  onLogout: () => void
  isLoggingOut: boolean
}

function SidebarContent({
  userName,
  userNik,
  pathname,
  onNavigate,
  onLogout,
  isLoggingOut,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-green-800/30">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">SD</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{APP_NAME}</p>
            <p className="text-green-300 text-xs">Portal Warga</p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-green-800/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-linear-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{userName}</p>
            {userNik && (
              <p className="text-green-300 text-xs font-mono truncate">NIK: {userNik}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-green-400/60 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-green-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <span
                className={cn(
                  'shrink-0 transition-transform duration-150 group-hover:scale-110',
                  isActive ? 'text-white' : 'text-green-300'
                )}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Berita & Logout */}
      <div className="px-3 py-4 border-t border-green-800/30 space-y-1">
        <Link
          href="/berita"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <svg className="w-5 h-5 shrink-0 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Berita Desa
        </Link>
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isLoggingOut ? 'Keluar...' : 'Keluar'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

interface SidebarWargaProps {
  userName?: string
  userNik?: string
}

export default function SidebarWarga({ userName = 'Warga', userNik }: SidebarWargaProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const sharedProps: SidebarContentProps = {
    userName,
    userNik,
    pathname,
    onNavigate: () => setMobileOpen(false),
    onLogout: handleLogout,
    isLoggingOut,
  }

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 bg-linear-to-b from-green-800 to-emerald-900 flex-col fixed inset-y-0 left-0 z-30 shadow-xl shadow-green-900/40">
        <SidebarContent {...sharedProps} />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center shadow-lg text-white"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-linear-to-b from-green-800 to-emerald-900 z-50 flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-green-300 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent {...sharedProps} />
          </aside>
        </>
      )}
    </>
  )
}