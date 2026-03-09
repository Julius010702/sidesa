'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'

const kegiatanSlides = [
  {
    src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
    judul: 'Gotong Royong Pembersihan Desa',
    tanggal: '12 Januari 2024',
    kategori: 'Lingkungan',
  },
  {
    src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80',
    judul: 'Posyandu Balita Rutin Bulanan',
    tanggal: '5 Februari 2024',
    kategori: 'Kesehatan',
  },
  {
    src: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200&q=80',
    judul: 'Musyawarah Desa Tahunan',
    tanggal: '20 Maret 2024',
    kategori: 'Pemerintahan',
  },
  {
    src: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=1200&q=80',
    judul: 'Pelatihan UMKM Warga Desa',
    tanggal: '8 April 2024',
    kategori: 'Ekonomi',
  },
  {
    src: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=1200&q=80',
    judul: 'HUT Kemerdekaan RI ke-79',
    tanggal: '17 Agustus 2024',
    kategori: 'Perayaan',
  },
]

const kategoriColor: Record<string, string> = {
  Lingkungan: 'bg-emerald-500',
  Kesehatan: 'bg-blue-500',
  Pemerintahan: 'bg-amber-500',
  Ekonomi: 'bg-purple-500',
  Perayaan: 'bg-rose-500',
}

// ← Dipindah keluar dari HomePage
function LogoIcon({ size = 'md', logoUrl }: { size?: 'sm' | 'md'; logoUrl: string | null }) {
  const cls = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const px = size === 'sm' ? 28 : 36
  return (
    <div className={`${cls} bg-green-600 rounded-xl flex items-center justify-center shadow-sm overflow-hidden shrink-0`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt="Logo Desa"
          width={px}
          height={px}
          className="w-full h-full object-contain"
          unoptimized
        />
      ) : (
        <span className="text-white font-bold text-xs">SD</span>
      )}
    </div>
  )
}

export default function HomePage() {
  const [current, setCurrent] = useState(0)
  const [sliding, setSliding] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('left')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [namaDesa, setNamaDesa] = useState('SIDESAA')

  useEffect(() => {
    fetch('/api/profil-desa')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setLogoUrl(d.data.logoUrl ?? null)
          setNamaDesa(d.data.namaDesaa ?? 'SIDESAA')
        }
      })
      .catch(() => {})
  }, [])

  const goTo = useCallback(
    (index: number, dir?: 'left' | 'right') => {
      if (sliding) return
      const d = dir ?? (index > current ? 'left' : 'right')
      setDirection(d)
      setSliding(true)
      setTimeout(() => {
        setCurrent(index)
        setSliding(false)
      }, 450)
    },
    [sliding, current]
  )

  const next = useCallback(() => {
    goTo((current + 1) % kegiatanSlides.length, 'left')
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + kegiatanSlides.length) % kegiatanSlides.length, 'right')
  }, [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoIcon size="md" logoUrl={logoUrl} />
            <span className="font-bold text-gray-900 text-lg">{namaDesa}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/berita"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block"
            >
              Berita Desa
            </Link>
            <Link
              href="/login"
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium hidden sm:block"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* ===================== HERO SLIDESHOW ===================== */}
      <style>{`
        @keyframes slideInLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideInRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes slideOutLeft { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
        .slide-in-left  { animation: slideInLeft  0.45s ease forwards; }
        .slide-in-right { animation: slideInRight 0.45s ease forwards; }
        .slide-out-left  { animation: slideOutLeft  0.45s ease forwards; }
        .slide-out-right { animation: slideOutRight 0.45s ease forwards; }
      `}</style>

      <section className="relative w-full h-44 sm:h-56 overflow-hidden bg-gray-900 max-w-6xl mx-auto mt-6 rounded-2xl">
        <div
          key={current}
          className={`absolute inset-0 ${sliding
            ? direction === 'left' ? 'slide-out-left' : 'slide-out-right'
            : direction === 'left' ? 'slide-in-left' : 'slide-in-right'
          }`}
        >
          <Image
            src={kegiatanSlides[current].src}
            alt={kegiatanSlides[current].judul}
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent z-10" />

        <div className="absolute bottom-10 left-4 sm:left-6 z-20">
          <span
            className={`inline-block text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-1.5 ${
              kategoriColor[kegiatanSlides[current].kategori] ?? 'bg-green-600'
            }`}
          >
            {kegiatanSlides[current].kategori}
          </span>
          <p className="text-white font-semibold text-sm sm:text-base leading-snug">
            {kegiatanSlides[current].judul}
          </p>
          <p className="text-white/50 text-xs mt-0.5">{kegiatanSlides[current].tanggal}</p>
        </div>

        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm text-lg"
          aria-label="Sebelumnya"
        >‹</button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm text-lg"
          aria-label="Berikutnya"
        >›</button>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {kegiatanSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-green-400 w-5 h-1.5'
                  : 'bg-white/40 hover:bg-white/70 w-1.5 h-1.5'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Hero teks */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-1.5 rounded-full mb-5 border border-green-100">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Sistem Digital Desa
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Pelayanan Desa yang<br />
          <span className="text-green-600">Mudah & Transparan</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
          Ajukan surat, sampaikan pengaduan, cek bantuan sosial, dan pantau
          informasi desa — semua dari genggaman tangan Anda.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm shadow-sm shadow-green-200"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/login"
            className="bg-gray-50 text-gray-700 border border-gray-200 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm"
          >
            Sudah Punya Akun
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '📄', title: 'Surat Digital', desc: 'Ajukan & unduh surat online tanpa antri' },
            { icon: '📢', title: 'Pengaduan', desc: 'Laporkan masalah lingkungan desa' },
            { icon: '💰', title: 'Bansos', desc: 'Cek status bantuan sosial Anda' },
            { icon: '📰', title: 'Berita Desa', desc: 'Info & pengumuman terkini' },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center hover:shadow-md hover:border-green-100 transition-all"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">{f.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Cara Menggunakan</h2>
          <p className="text-gray-500 mb-12 text-sm">Hanya 3 langkah mudah</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Daftar Akun', desc: 'Buat akun dengan NIK dan email Anda' },
              { step: '2', title: 'Pilih Layanan', desc: 'Ajukan surat, buat pengaduan, atau cek bansos' },
              { step: '3', title: 'Pantau Status', desc: 'Terima notifikasi dan pantau progres secara real-time' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-sm shadow-green-200">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Siap menggunakan layanan desa digital?
          </h2>
          <p className="text-gray-500 mb-8 text-sm">
            Bergabung dengan warga desa yang sudah merasakan kemudahan layanan digital.
          </p>
          <Link
            href="/register"
            className="inline-block bg-green-600 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
          >
            Daftar Gratis Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LogoIcon size="sm" logoUrl={logoUrl} />
            <span className="font-semibold text-gray-700 text-sm">{namaDesa}</span>
          </div>
          <p className="text-xs text-gray-400">
            © 2024 SIDESAA · Sistem Informasi Desa Digital
          </p>
          <div className="flex gap-4">
            <Link href="/berita" className="text-xs text-gray-400 hover:text-gray-600">Berita</Link>
            <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600">Masuk</Link>
            <Link href="/register" className="text-xs text-gray-400 hover:text-gray-600">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}