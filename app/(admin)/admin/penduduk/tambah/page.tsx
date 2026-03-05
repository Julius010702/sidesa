'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HeaderPage from '@/components/layout/HeaderPage'

const agamaOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']
const pendidikanOptions = ['Tidak/Belum Sekolah', 'SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3']
const pekerjaanOptions = ['Belum/Tidak Bekerja', 'Pelajar/Mahasiswa', 'Petani', 'Nelayan', 'Wiraswasta', 'Karyawan Swasta', 'PNS', 'TNI/Polri', 'Pensiunan', 'Ibu Rumah Tangga', 'Buruh', 'Lainnya']
const statusKawinOptions = ['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI']
const hubunganOptions = ['KEPALA_KELUARGA', 'ISTRI', 'ANAK', 'MENANTU', 'CUCU', 'ORANG_TUA', 'MERTUA', 'FAMILI_LAIN', 'PEMBANTU', 'LAINNYA']

const labelKawin: Record<string, string> = {
  BELUM_KAWIN: 'Belum Kawin', KAWIN: 'Kawin',
  CERAI_HIDUP: 'Cerai Hidup', CERAI_MATI: 'Cerai Mati',
}
const labelHubungan: Record<string, string> = {
  KEPALA_KELUARGA: 'Kepala Keluarga', ISTRI: 'Istri/Suami', ANAK: 'Anak',
  MENANTU: 'Menantu', CUCU: 'Cucu', ORANG_TUA: 'Orang Tua',
  MERTUA: 'Mertua', FAMILI_LAIN: 'Famili Lain', PEMBANTU: 'Pembantu', LAINNYA: 'Lainnya',
}

interface FormData {
  nik: string
  noKK: string
  nama: string
  jenisKelamin: 'L' | 'P' | ''
  tempatLahir: string
  tanggalLahir: string
  agama: string
  pendidikan: string
  pekerjaan: string
  statusPerkawinan: string
  hubunganDenganKepala: string
  kewarganegaraan: string
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
}

const initialForm: FormData = {
  nik: '', noKK: '', nama: '', jenisKelamin: '',
  tempatLahir: '', tanggalLahir: '', agama: '', pendidikan: '',
  pekerjaan: '', statusPerkawinan: '', hubunganDenganKepala: '',
  kewarganegaraan: 'WNI', alamat: '', rt: '', rw: '',
  kelurahan: '', kecamatan: '', kabupaten: '', provinsi: '',
}

function InputField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = (err?: string) =>
  `w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
    err ? 'border-red-300 bg-red-50' : 'border-gray-200'
  }`

export default function TambahPendudukPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  function set(field: keyof FormData, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    setFieldErrors((p) => ({ ...p, [field]: '' }))
    setError('')
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {}
    if (form.nik.length !== 16) errs.nik = 'NIK harus 16 digit'
    if (form.noKK.length !== 16) errs.noKK = 'No. KK harus 16 digit'
    if (!form.nama.trim()) errs.nama = 'Nama wajib diisi'
    if (!form.jenisKelamin) errs.jenisKelamin = 'Pilih jenis kelamin'
    if (!form.tempatLahir.trim()) errs.tempatLahir = 'Tempat lahir wajib diisi'
    if (!form.tanggalLahir) errs.tanggalLahir = 'Tanggal lahir wajib diisi'
    if (!form.agama) errs.agama = 'Pilih agama'
    if (!form.statusPerkawinan) errs.statusPerkawinan = 'Pilih status perkawinan'
    if (!form.hubunganDenganKepala) errs.hubunganDenganKepala = 'Pilih hubungan dengan kepala KK'
    if (!form.alamat.trim()) errs.alamat = 'Alamat wajib diisi'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/penduduk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal menyimpan data'); return }
      router.push(`/admin/penduduk/${data.data.id}?baru=1`)
    } catch {
      setError('Terjadi kesalahan, periksa koneksi Anda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <HeaderPage
        title="Tambah Penduduk"
        subtitle="Daftarkan data penduduk baru"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Penduduk', href: '/admin/penduduk' },
          { label: 'Tambah' },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
        {/* Identitas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Identitas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="NIK" required error={fieldErrors.nik}>
              <input value={form.nik} onChange={(e) => set('nik', e.target.value)}
                placeholder="16 digit NIK" maxLength={16}
                className={inputCls(fieldErrors.nik)} />
            </InputField>
            <InputField label="Nomor KK" required error={fieldErrors.noKK}>
              <input value={form.noKK} onChange={(e) => set('noKK', e.target.value)}
                placeholder="16 digit No. KK" maxLength={16}
                className={inputCls(fieldErrors.noKK)} />
            </InputField>
            <InputField label="Nama Lengkap" required error={fieldErrors.nama}>
              <input value={form.nama} onChange={(e) => set('nama', e.target.value)}
                placeholder="Sesuai dokumen resmi"
                className={inputCls(fieldErrors.nama)} />
            </InputField>
            <InputField label="Jenis Kelamin" required error={fieldErrors.jenisKelamin}>
              <select value={form.jenisKelamin} onChange={(e) => set('jenisKelamin', e.target.value)}
                className={inputCls(fieldErrors.jenisKelamin)}>
                <option value="">-- Pilih --</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </InputField>
            <InputField label="Tempat Lahir" required error={fieldErrors.tempatLahir}>
              <input value={form.tempatLahir} onChange={(e) => set('tempatLahir', e.target.value)}
                placeholder="Kota/Kabupaten"
                className={inputCls(fieldErrors.tempatLahir)} />
            </InputField>
            <InputField label="Tanggal Lahir" required error={fieldErrors.tanggalLahir}>
              <input type="date" value={form.tanggalLahir} onChange={(e) => set('tanggalLahir', e.target.value)}
                className={inputCls(fieldErrors.tanggalLahir)} />
            </InputField>
            <InputField label="Agama" required error={fieldErrors.agama}>
              <select value={form.agama} onChange={(e) => set('agama', e.target.value)}
                className={inputCls(fieldErrors.agama)}>
                <option value="">-- Pilih --</option>
                {agamaOptions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </InputField>
            <InputField label="Kewarganegaraan">
              <select value={form.kewarganegaraan} onChange={(e) => set('kewarganegaraan', e.target.value)}
                className={inputCls()}>
                <option value="WNI">WNI</option>
                <option value="WNA">WNA</option>
              </select>
            </InputField>
          </div>
        </div>

        {/* Status & Pendidikan */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Status & Pendidikan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Pendidikan Terakhir">
              <select value={form.pendidikan} onChange={(e) => set('pendidikan', e.target.value)}
                className={inputCls()}>
                <option value="">-- Pilih --</option>
                {pendidikanOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </InputField>
            <InputField label="Pekerjaan">
              <select value={form.pekerjaan} onChange={(e) => set('pekerjaan', e.target.value)}
                className={inputCls()}>
                <option value="">-- Pilih --</option>
                {pekerjaanOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </InputField>
            <InputField label="Status Perkawinan" required error={fieldErrors.statusPerkawinan}>
              <select value={form.statusPerkawinan} onChange={(e) => set('statusPerkawinan', e.target.value)}
                className={inputCls(fieldErrors.statusPerkawinan)}>
                <option value="">-- Pilih --</option>
                {statusKawinOptions.map((s) => <option key={s} value={s}>{labelKawin[s]}</option>)}
              </select>
            </InputField>
            <InputField label="Hubungan dengan Kepala KK" required error={fieldErrors.hubunganDenganKepala}>
              <select value={form.hubunganDenganKepala} onChange={(e) => set('hubunganDenganKepala', e.target.value)}
                className={inputCls(fieldErrors.hubunganDenganKepala)}>
                <option value="">-- Pilih --</option>
                {hubunganOptions.map((h) => <option key={h} value={h}>{labelHubungan[h]}</option>)}
              </select>
            </InputField>
          </div>
        </div>

        {/* Alamat */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Alamat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputField label="Alamat" required error={fieldErrors.alamat}>
                <textarea value={form.alamat} onChange={(e) => set('alamat', e.target.value)}
                  rows={2} placeholder="Nama jalan, nomor rumah..."
                  className={`${inputCls(fieldErrors.alamat)} resize-none`} />
              </InputField>
            </div>
            <InputField label="RT">
              <input value={form.rt} onChange={(e) => set('rt', e.target.value)}
                placeholder="001" className={inputCls()} />
            </InputField>
            <InputField label="RW">
              <input value={form.rw} onChange={(e) => set('rw', e.target.value)}
                placeholder="001" className={inputCls()} />
            </InputField>
            <InputField label="Kelurahan/Desa">
              <input value={form.kelurahan} onChange={(e) => set('kelurahan', e.target.value)}
                className={inputCls()} />
            </InputField>
            <InputField label="Kecamatan">
              <input value={form.kecamatan} onChange={(e) => set('kecamatan', e.target.value)}
                className={inputCls()} />
            </InputField>
            <InputField label="Kabupaten/Kota">
              <input value={form.kabupaten} onChange={(e) => set('kabupaten', e.target.value)}
                className={inputCls()} />
            </InputField>
            <InputField label="Provinsi">
              <input value={form.provinsi} onChange={(e) => set('provinsi', e.target.value)}
                className={inputCls()} />
            </InputField>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/admin/penduduk"
            className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Batal
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : 'Simpan Data'}
          </button>
        </div>
      </form>
    </div>
  )
}