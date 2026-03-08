'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nik: '',
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    noHp: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ isVerified: boolean; message: string } | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (form.nik.length !== 16 || !/^\d+$/.test(form.nik)) {
      errors.nik = 'NIK harus 16 digit angka'
    }
    if (form.nama.length < 2) {
      errors.nama = 'Nama minimal 2 karakter'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Format email tidak valid'
    }
    if (form.password.length < 6) {
      errors.password = 'Password minimal 6 karakter'
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Password tidak cocok'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik: form.nik,
          nama: form.nama,
          email: form.email,
          password: form.password,
          noHp: form.noHp || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registrasi gagal')
        return
      }

      // Tampilkan pesan berdasarkan status verifikasi
      setSuccessInfo({ isVerified: data.isVerified, message: data.message })

      // Jika langsung terverifikasi, redirect ke login setelah 3 detik
      if (data.isVerified) {
        setTimeout(() => router.push('/login?registered=1'), 3000)
      }
    } catch {
      setError('Terjadi kesalahan, periksa koneksi Anda')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    {
      name: 'nik',
      label: 'NIK',
      type: 'text',
      placeholder: '3201xxxxxxxxxxxxxxxx',
      maxLength: 16,
      helpText: '16 digit sesuai KTP',
      required: true,
    },
    {
      name: 'nama',
      label: 'Nama Lengkap',
      type: 'text',
      placeholder: 'Nama sesuai KTP',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'email@contoh.com',
      required: true,
    },
    {
      name: 'noHp',
      label: 'No. HP (opsional)',
      type: 'tel',
      placeholder: '08xxxxxxxxxx',
      required: false,
    },
  ]

  // ✅ Tampilan sukses
  if (successInfo) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-8 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          successInfo.isVerified ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          {successInfo.isVerified ? (
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {successInfo.isVerified ? 'Registrasi Berhasil!' : 'Pendaftaran Diterima!'}
        </h2>

        <p className="text-sm text-gray-600 mb-5">{successInfo.message}</p>

        {successInfo.isVerified ? (
          <div>
            <p className="text-xs text-gray-400 mb-4">Mengarahkan ke halaman login...</p>
            <Link
              href="/login"
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Masuk Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
              <p className="text-xs font-semibold text-blue-800 mb-3">Apa yang terjadi selanjutnya?</p>
              <div className="space-y-2.5">
                <div className="flex gap-3 items-start">
                  <span className="text-base shrink-0">✅</span>
                  <p className="text-xs text-blue-700">Akun dan data kependudukan Anda sudah tercatat di sistem desa.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-base shrink-0">📋</span>
                  <p className="text-xs text-blue-700">Admin desa akan melengkapi data Anda dan memverifikasi akun.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-base shrink-0">🔔</span>
                  <p className="text-xs text-blue-700">Setelah diverifikasi, Anda bisa menggunakan semua layanan desa.</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left">
              <p className="text-xs text-gray-500">
                Anda sudah bisa mencoba login sekarang. Hubungi kantor desa jika butuh bantuan.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-1">
              <Link href="/login"
                className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                Coba Masuk
              </Link>
              <Link href="/"
                className="inline-block border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Ke Beranda
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Buat Akun Baru</h2>
        <p className="text-sm text-gray-500 mt-1">
          Daftarkan diri Anda sebagai warga desa
        </p>
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
        {fields.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="block text-sm font-medium text-gray-700 mb-1.5">
              {f.label}
              {f.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              placeholder={f.placeholder}
              maxLength={f.maxLength}
              required={f.required}
              value={form[f.name as keyof typeof form]}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                transition-all placeholder:text-gray-300
                ${fieldErrors[f.name] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {fieldErrors[f.name] && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors[f.name]}</p>
            )}
            {f.helpText && !fieldErrors[f.name] && (
              <p className="text-xs text-gray-400 mt-1">{f.helpText}</p>
            )}
          </div>
        ))}

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Minimal 6 karakter"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 pr-10
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                transition-all placeholder:text-gray-300
                ${fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
          {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
        </div>

        {/* Konfirmasi Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Konfirmasi Password <span className="text-red-500">*</span>
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Ulangi password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
              transition-all placeholder:text-gray-300
              ${fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>

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
              Mendaftar...
            </>
          ) : (
            'Daftar Sekarang'
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:text-green-700 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}