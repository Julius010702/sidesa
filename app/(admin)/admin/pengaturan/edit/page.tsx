import prisma from '@/lib/prisma'
import Link from 'next/link'
import { PengaturanForm } from './PengaturanForm'

export default async function PengaturanEditPage() {
  const profil = await prisma.profilDesa.findFirst()

  return (
    <div className="pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/pengaturan"
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">✏️ Edit Pengaturan Desa</h1>
          <p className="text-sm text-gray-500 mt-0.5">Perbarui informasi identitas dan profil desa</p>
        </div>
      </div>

      <PengaturanForm profil={profil} />
    </div>
  )
}