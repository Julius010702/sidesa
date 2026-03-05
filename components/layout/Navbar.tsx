import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'

/**
 * Navbar
 * Navbar publik untuk halaman landing, berita, dan halaman publik lainnya.
 * Tidak memerlukan autentikasi.
 */
export default function Navbar() {
  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">SD</span>
          </div>
          <Link href="/" className="font-bold text-gray-900 text-lg hover:text-green-700 transition-colors">
            {APP_NAME}
          </Link>
        </div>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-1">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Beranda
          </Link>
          <Link
            href="/berita"
            className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Berita Desa
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium hidden sm:block"
          >
            Daftar
          </Link>
        </div>
      </div>
    </nav>
  )
}