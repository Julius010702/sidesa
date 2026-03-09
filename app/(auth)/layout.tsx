import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Login — SIDESAA',
  description: 'Masuk ke akun SIDESAA Anda',
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const profil = await prisma.profilDesa.findFirst({
    select: { namaDesaa: true, logoUrl: true },
  })

  const namaDesa = profil?.namaDesaa ?? 'SIDESAA'
  const logoUrl = profil?.logoUrl ?? null

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 overflow-hidden">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`Logo ${namaDesa}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-white font-bold text-2xl">SD</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{namaDesa}</h1>
              <p className="text-sm text-gray-500">Sistem Informasi Desa Digital</p>
            </div>
          </Link>
        </div>

        {/* Content */}
        {children}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 SIDESAA · Pelayanan Desa Digital
        </p>
      </div>
    </div>
  )
}