'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ''

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal, coba lagi')
        return
      }

      const adminRoles = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']
      const isAdmin = adminRoles.includes(data.data.role)

      if (redirectTo) {
        router.push(redirectTo)
      } else if (isAdmin) {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }

      router.refresh()
    } catch {
      setError('Terjadi kesalahan, periksa koneksi Anda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Masuk ke Akun</h2>
        <p className="text-sm text-gray-500 mt-1">Masukkan email dan password Anda</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@contoh.com"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
              transition-all placeholder:text-gray-300"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm pr-10
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                transition-all placeholder:text-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-xl
            font-semibold text-sm hover:from-green-700 hover:to-emerald-700 transition-all
            disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-green-200
            flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>
      </form>

      {/* Register link */}
      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Belum punya akun?{' '}
          <Link href="/register" className="text-green-600 font-semibold hover:text-green-700 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
        <p className="text-xs font-semibold text-blue-700 mb-1.5">Demo Akun (setelah seed):</p>
        <div className="space-y-1">
          <p className="text-xs text-blue-600">
            Admin: <span className="font-mono bg-blue-100 px-1 rounded">admin@desa.id</span> /
            <span className="font-mono bg-blue-100 px-1 rounded ml-1">admin123</span>
          </p>
          <p className="text-xs text-blue-600">
            Warga: <span className="font-mono bg-blue-100 px-1 rounded">warga@desa.id</span> /
            <span className="font-mono bg-blue-100 px-1 rounded ml-1">warga123</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-2xl p-8 text-center text-gray-400">Memuat...</div>
    }>
      <LoginForm />
    </Suspense>
  )
}