import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/lib/prisma'

export default async function PengaturanPage() {
  const profil = await prisma.profilDesa.findFirst()

  return (
    <div className="max-w-3xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">⚙️ Pengaturan Desa</h1>
          <p className="text-sm text-gray-500 mt-0.5">Informasi identitas dan profil desa</p>
        </div>
        <Link
          href="/admin/pengaturan/edit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Pengaturan
        </Link>
      </div>

      {!profil ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-8 text-center">
          <p className="text-yellow-700 font-semibold text-sm mb-3">⚠️ Data desa belum diisi</p>
          <Link
            href="/admin/pengaturan/edit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-xl hover:bg-yellow-600 transition-colors"
          >
            Isi Sekarang
          </Link>
        </div>
      ) : (
        <>
          {/* Banner */}
          {profil.bannerUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <Image
                src={profil.bannerUrl}
                alt="Banner Desa"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Identitas */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">🏛️ Identitas Desa</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                  {profil.logoUrl ? (
                    <Image
                      src={profil.logoUrl}
                      alt="Logo Desa"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-gray-400 text-xs font-bold">LOGO</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{profil.namaDesaa}</h3>
                  <p className="text-sm text-gray-500">Kepala Desa: <span className="font-semibold text-gray-700">{profil.kepalaDesaa}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Alamat Kantor" value={profil.alamat} />
                <InfoRow label="No. Telepon" value={profil.telepon} />
                <InfoRow label="Email" value={profil.email} />
                <InfoRow label="Website" value={profil.website} />
                <InfoRow label="Luas Wilayah" value={profil.luasWilayah ? `${profil.luasWilayah} ha` : null} />
                <InfoRow label="Jumlah Dusun" value={profil.jumlahDusun ? `${profil.jumlahDusun} dusun` : null} />
              </div>
            </div>
          </div>

          {/* Profil */}
          {(profil.deskripsi || profil.visi || profil.misi) && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800">📝 Profil Desa</h2>
              </div>
              <div className="p-5 space-y-5">
                {profil.deskripsi && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Deskripsi</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{profil.deskripsi}</p>
                  </div>
                )}
                {profil.visi && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Visi</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{profil.visi}</p>
                  </div>
                )}
                {profil.misi && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Misi</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{profil.misi}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || <span className="text-gray-400 font-normal">—</span>}</p>
    </div>
  )
}