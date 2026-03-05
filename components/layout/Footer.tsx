import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 bg-white">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">SD</span>
          </div>
          <span className="font-semibold text-gray-700 text-sm">SIDESAA</span>
        </div>
        <p className="text-xs text-gray-400">© 2024 SIDESAA · Sistem Informasi Desa Digital</p>
        <div className="flex gap-4">
          <Link href="/berita" className="text-xs text-gray-400 hover:text-gray-600">Berita</Link>
          <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600">Masuk</Link>
          <Link href="/register" className="text-xs text-gray-400 hover:text-gray-600">Daftar</Link>
        </div>
      </div>
    </footer>
  )
}