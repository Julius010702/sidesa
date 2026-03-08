import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import HeaderPage from '@/components/layout/HeaderPage'
import { formatTanggal, hitungUmur } from '@/lib/utils'
import { JenisKelamin } from '@prisma/client'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

async function getPenduduk(id: string) {
  return prisma.penduduk.findUnique({
    where: { id },
    include: {
      // ✅ Tambah include user untuk ambil fotoUrl
      user: {
        select: {
          id: true,
          email: true,
          fotoUrl: true,
          isVerified: true,
          isActive: true,
          role: true,
        },
      },
      kartuKeluarga: {
        include: {
          anggota: {
            where: { statusHidup: true },
            select: {
              id: true,
              nama: true,
              nik: true,
              tanggalLahir: true,
              jenisKelamin: true,
              statusKawin: true,
            },
          },
        },
      },
      bansos: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  })
}

type PendudukDetail = NonNullable<Awaited<ReturnType<typeof getPenduduk>>>
type AnggotaKK = NonNullable<PendudukDetail['kartuKeluarga']>['anggota'][number]

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ baru?: string }>
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-40 shrink-0">{label}</span>
      <span className="text-xs text-gray-700 font-medium">{value || '-'}</span>
    </div>
  )
}

export default async function DetailPendudukPage({ params, searchParams }: PageProps) {
  const session = await getSession()
  if (!session || !ADMIN_ROLES.includes(session.role)) redirect('/login')

  const { id } = await params
  const { baru } = await searchParams

  const penduduk = await getPenduduk(id)
  if (!penduduk) notFound()

  const anggotaKK = penduduk.kartuKeluarga?.anggota ?? []
  const fotoUrl = penduduk.user?.fotoUrl ?? null

  return (
    <div>
      <HeaderPage
        title="Detail Penduduk"
        subtitle={penduduk.nama}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Penduduk', href: '/admin/penduduk' },
          { label: penduduk.nama },
        ]}
        action={
          <Link
            href={`/admin/penduduk/${id}/edit`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Edit Data
          </Link>
        }
      />

      {baru === '1' && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3 mb-5">
          <p className="text-sm font-medium text-green-800">Data penduduk berhasil ditambahkan!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-5">
              {/* ✅ Foto profil dari akun warga */}
              <div className="relative shrink-0">
                {fotoUrl ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <Image
                      src={fotoUrl}
                      alt={penduduk.nama}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm ${
                    penduduk.jenisKelamin === JenisKelamin.LAKI_LAKI
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-pink-100 text-pink-700'
                  }`}>
                    {penduduk.nama.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Badge verifikasi akun */}
                {penduduk.user?.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white" title="Akun terverifikasi">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">{penduduk.nama}</h2>
                <p className="text-sm text-gray-500 font-mono">{penduduk.nik}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    penduduk.jenisKelamin === JenisKelamin.LAKI_LAKI
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-pink-50 text-pink-700'
                  }`}>
                    {penduduk.jenisKelamin === JenisKelamin.LAKI_LAKI ? 'Laki-laki' : 'Perempuan'}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {hitungUmur(penduduk.tanggalLahir)} tahun
                  </span>
                  {penduduk.user && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      penduduk.user.isVerified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {penduduk.user.isVerified ? '✓ Terverifikasi' : '⏳ Belum diverifikasi'}
                    </span>
                  )}
                </div>
                {/* Email akun jika ada */}
                {penduduk.user?.email && (
                  <p className="text-xs text-gray-400 mt-1">{penduduk.user.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Identitas</p>
                <InfoRow label="NIK" value={penduduk.nik} />
                <InfoRow label="No. KK" value={penduduk.noKK} />
                <InfoRow label="Tempat Lahir" value={penduduk.tempatLahir} />
                <InfoRow label="Tanggal Lahir" value={formatTanggal(penduduk.tanggalLahir)} />
                <InfoRow label="Agama" value={penduduk.agama} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                <InfoRow label="Pendidikan" value={penduduk.pendidikan} />
                <InfoRow label="Pekerjaan" value={penduduk.pekerjaan} />
                <InfoRow label="Status Kawin" value={penduduk.statusKawin?.replace(/_/g, ' ')} />
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Alamat</p>
            <InfoRow label="Jalan/Nomor" value={penduduk.alamat} />
            <InfoRow label="RT/RW" value={`${penduduk.rt ?? '-'} / ${penduduk.rw ?? '-'}`} />
            <InfoRow label="Kelurahan/Desa" value={penduduk.kelurahan} />
            <InfoRow label="Kecamatan" value={penduduk.kecamatan} />
            <InfoRow label="Kabupaten/Kota" value={penduduk.kabupaten} />
            <InfoRow label="Provinsi" value={penduduk.provinsi} />
          </div>

          {/* KK & Anggota */}
          {penduduk.kartuKeluarga && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kartu Keluarga · {penduduk.kartuKeluarga.noKK}
                </p>
                <Link
                  href={`/admin/kartu-keluarga/${penduduk.kartuKeluarga.id}`}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Lihat KK →
                </Link>
              </div>
              <div className="space-y-2">
                {anggotaKK.map((a: AnggotaKK) => (
                  <Link
                    key={a.id}
                    href={`/admin/penduduk/${a.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors hover:border-blue-200 ${
                      a.id === penduduk.id ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50/50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      a.jenisKelamin === JenisKelamin.LAKI_LAKI
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {a.nama.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {a.nama}
                        {a.id === penduduk.id && <span className="ml-1 text-blue-500">(ini)</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        {a.statusKawin?.replace(/_/g, ' ')} · {hitungUmur(a.tanggalLahir)} th
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Aksi & Bansos */}
        <div className="space-y-4">
          {/* Info akun */}
          {penduduk.user && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Info Akun</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {fotoUrl ? (
                    <Image src={fotoUrl} alt={penduduk.nama} width={32} height={32}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {penduduk.nama.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{penduduk.user.email}</p>
                    <p className="text-xs text-gray-400">{penduduk.user.role}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    penduduk.user.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {penduduk.user.isVerified ? '✓ Terverifikasi' : '⏳ Belum diverifikasi'}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    penduduk.user.isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {penduduk.user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                {fotoUrl && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Foto profil sudah diupload
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Aksi</h3>
            <div className="space-y-2">
              <Link href={`/admin/penduduk/${id}/edit`}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                Edit Data
              </Link>
              <Link href="/admin/penduduk/tambah"
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Tambah Penduduk Lain
              </Link>
              <Link href="/admin/penduduk"
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Kembali ke Daftar
              </Link>
            </div>
          </div>

          {penduduk.bansos.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Bantuan Sosial</h3>
              <div className="space-y-2">
                {penduduk.bansos.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{b.jenisBansos}</p>
                      <p className="text-xs text-gray-400">{formatTanggal(b.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}