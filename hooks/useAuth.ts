'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export type Role = 'WARGA' | 'ADMIN_DESA' | 'SEKDES' | 'KASI_PELAYANAN' | 'KAUR_UMUM' | 'RT_RW'

export interface AuthUser {
  userId: string
  nama: string
  email: string
  role: Role
}

interface UseAuthOptions {
  redirectTo?: string       // redirect jika belum login
  redirectIfFound?: string  // redirect jika sudah login
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const redirectTo = options.redirectTo
  const redirectIfFound = options.redirectIfFound

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setUser(data)
        if (!data && redirectTo) router.replace(redirectTo)
        if (data && redirectIfFound) router.replace(redirectIfFound)
      })
      .catch(() => {
        setUser(null)
        if (redirectTo) router.replace(redirectTo)
      })
      .finally(() => setLoading(false))
  }, [router, redirectTo, redirectIfFound])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.replace('/login')
  }

  const isAdmin = user
    ? ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW'].includes(user.role)
    : false

  return { user, loading, logout, isAdmin }
}