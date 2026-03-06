'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const agamaOptions = [
  { value: 'ISLAM', label: 'Islam' },
  { value: 'KRISTEN', label: 'Kristen' },
  { value: 'KATOLIK', label: 'Katolik' },
  { value: 'HINDU', label: 'Hindu' },
  { value: 'BUDDHA', label: 'Buddha' },
  { value: 'KONGHUCU', label: 'Konghucu' },
]

const pendidikanOptions = ['Tidak/Belum Sekolah', 'SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3']
const pekerjaanOptions = ['Belum/Tidak Bekerja', 'Pelajar/Mahasiswa', 'Petani', 'Nelayan', 'Wiraswasta', 'Karyawan Swasta', 'PNS', 'TNI/Polri', 'Pensiunan', 'Ibu Rumah Tangga', 'Buruh', 'Lainnya']
const golonganDarahOptions = ['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const statusKawinOptions = [
  { value: 'BELUM_KAWIN', label: 'Belum Kawin' },
  { value: 'KAWIN', label: 'Kawin' },
  { value: 'CERAI_HIDUP', label: 'Cerai Hidup' },
  { value: 'CERAI_MATI', label: 'Cerai Mati' },
]

interface PendudukData {
  id: string
  nik: string
  noKK: string
  nama: string
  jenisKelamin: string
  tempatLahir: string
  tanggalLahir: string
  agama: string
  statusKawin: string
  pendidikan: string
  pekerjaan: string
  golonganDarah: string
  alamat: string
  rt: string
  rw: string
  dusun: string
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  kodePos: string
  keterangan: string
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
  `w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
    err ? 'border-red-300 bg-red-50' : 'border-gray-200'
  }`

export default function EditPendudukClient({ penduduk }: { penduduk: PendudukData }) {
  const router = useRouter()
  const [form, setForm] = useState(penduduk)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PendudukData, string>>>({})

  function set(field: keyof PendudukData, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    setFieldErrors((p) => ({ ...p, [field]: '' }))
    setError('')
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof PendudukData, string>> = {}
    if (!form.nama.trim()) errs.nama = 'Nama wajib diisi'
    if (!form.jenisKelamin) errs.jenisKelamin = 'Pilih jenis kelamin'
    if (!form.tempatLahir.trim()) errs.tempatLahir = 'Tempat lahir wajib diisi'
    if (!form.tanggalLahir) errs.tanggalLahir = 'Tanggal lahir wajib diisi'
    if (!form.agama) errs.agama = 'Pilih agama'
    if (!form.statusKawin) errs.statusKawin = 'Pilih status perkawinan'
    if (!form.alamat.trim()) errs.alamat = 'Alamat wajib diisi'
    if (!form.rt.trim()) errs.rt = 'RT wajib diisi'
    if (!form.rw.trim()) errs.rw = 'RW wajib diisi'
    if (!form.kelurahan.trim()) errs.kelurahan = 'Kelurahan wajib diisi'
    if (!form.kecamatan.trim()) errs.kecamatan = 'Kecamatan wajib diisi'
    if (!form.kabupaten.trim()) errs.kabupaten = 'Kabupaten wajib diisi'
    if (!form.provinsi.trim()) errs.provinsi = 'Provinsi wajib diisi'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/penduduk/${penduduk.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama:             form.nama,
          tempatLahir:      form.tempatLahir,
          tanggalLahir:     form.tanggalLahir,
          agama:            form.agama,
          statusPerkawinan: form.statusKawin,
          pendidikan:       form.pendidikan,
          pekerjaan:        form.pekerjaan,
          golonganDarah:    form.golonganDarah || null,
          alamat:           form.alamat,
          rt:               form.rt,
          rw:               form.rw,
          dusun:            form.dusun || null,
          kelurahan:        form.kelurahan,
          kecamatan:        form.kecamatan,
          kabupaten:        form.kabupaten,
          provinsi:         form.provinsi,
          kodePos:          form.kodePos || null,
          keterangan:       form.keterangan || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal menyimpan data'); return }
      setSuccess('Data berhasil disimpan')
      setTimeout(() => router.push(`/admin/penduduk/${penduduk.id}`), 800)
    } catch {
      setError('Terjadi kesalahan, periksa koneksi Anda')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Hapus data penduduk ini? Tindakan tidak dapat dibatalkan.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/penduduk/${penduduk.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) router.push('/admin/penduduk')
      else setError(data.error ?? 'Gagal menghapus')
    } catch {
      setError('Terjadi kesalahan koneksi')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          <span>✅</span> {success}
        </div>
      )}

      {/* Identitas */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-4">Identitas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* NIK — readonly */}
          <InputField label="NIK">
            <input value={form.nik} readOnly
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </InputField>

          {/* No KK — readonly */}
          <InputField label="Nomor KK">
            <input value={form.noKK} readOnly
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </InputField>

          <InputField label="Nama Lengkap" required error={fieldErrors.nama}>
            <input value={form.nama} onChange={(e) => set('nama', e.target.value)}
              placeholder="Sesuai dokumen resmi" className={inputCls(fieldErrors.nama)} />
          </InputField>

          <InputField label="Jenis Kelamin" required error={fieldErrors.jenisKelamin}>
            <select value={form.jenisKelamin} onChange={(e) => set('jenisKelamin', e.target.value)}
              className={inputCls(fieldErrors.jenisKelamin)}>
              <option value="">-- Pilih --</option>
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </InputField>

          <InputField label="Tempat Lahir" required error={fieldErrors.tempatLahir}>
            <input value={form.tempatLahir} onChange={(e) => set('tempatLahir', e.target.value)}
              placeholder="Kota/Kabupaten" className={inputCls(fieldErrors.tempatLahir)} />
          </InputField>

          <InputField label="Tanggal Lahir" required error={fieldErrors.tanggalLahir}>
            <input type="date" value={form.tanggalLahir} onChange={(e) => set('tanggalLahir', e.target.value)}
              className={inputCls(fieldErrors.tanggalLahir)} />
          </InputField>

          <InputField label="Agama" required error={fieldErrors.agama}>
            <select value={form.agama} onChange={(e) => set('agama', e.target.value)}
              className={inputCls(fieldErrors.agama)}>
              <option value="">-- Pilih --</option>
              {agamaOptions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </InputField>

          <InputField label="Golongan Darah">
            <select value={form.golonganDarah} onChange={(e) => set('golonganDarah', e.target.value)}
              className={inputCls()}>
              <option value="">-- Tidak diketahui --</option>
              {golonganDarahOptions.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </InputField>
        </div>
      </div>

      {/* Status & Pendidikan */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-4">Status & Pendidikan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Status Perkawinan" required error={fieldErrors.statusKawin}>
            <select value={form.statusKawin} onChange={(e) => set('statusKawin', e.target.value)}
              className={inputCls(fieldErrors.statusKawin)}>
              <option value="">-- Pilih --</option>
              {statusKawinOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </InputField>

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

          <InputField label="RT" required error={fieldErrors.rt}>
            <input value={form.rt} onChange={(e) => set('rt', e.target.value)}
              placeholder="001" className={inputCls(fieldErrors.rt)} />
          </InputField>

          <InputField label="RW" required error={fieldErrors.rw}>
            <input value={form.rw} onChange={(e) => set('rw', e.target.value)}
              placeholder="001" className={inputCls(fieldErrors.rw)} />
          </InputField>

          <InputField label="Dusun">
            <input value={form.dusun} onChange={(e) => set('dusun', e.target.value)}
              className={inputCls()} />
          </InputField>

          <InputField label="Kode Pos">
            <input value={form.kodePos} onChange={(e) => set('kodePos', e.target.value)}
              placeholder="12345" className={inputCls()} />
          </InputField>

          <InputField label="Kelurahan/Desa" required error={fieldErrors.kelurahan}>
            <input value={form.kelurahan} onChange={(e) => set('kelurahan', e.target.value)}
              className={inputCls(fieldErrors.kelurahan)} />
          </InputField>

          <InputField label="Kecamatan" required error={fieldErrors.kecamatan}>
            <input value={form.kecamatan} onChange={(e) => set('kecamatan', e.target.value)}
              className={inputCls(fieldErrors.kecamatan)} />
          </InputField>

          <InputField label="Kabupaten/Kota" required error={fieldErrors.kabupaten}>
            <input value={form.kabupaten} onChange={(e) => set('kabupaten', e.target.value)}
              className={inputCls(fieldErrors.kabupaten)} />
          </InputField>

          <InputField label="Provinsi" required error={fieldErrors.provinsi}>
            <input value={form.provinsi} onChange={(e) => set('provinsi', e.target.value)}
              className={inputCls(fieldErrors.provinsi)} />
          </InputField>

          <div className="sm:col-span-2">
            <InputField label="Keterangan">
              <textarea value={form.keterangan} onChange={(e) => set('keterangan', e.target.value)}
                rows={2} placeholder="Catatan tambahan..."
                className={`${inputCls()} resize-none`} />
            </InputField>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" onClick={handleDelete} disabled={deleting}
          className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
          {deleting ? '⏳ Menghapus...' : '🗑 Hapus'}
        </button>
        <Link href={`/admin/penduduk/${penduduk.id}`}
          className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Batal
        </Link>
        <button type="submit" disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menyimpan...
            </>
          ) : '💾 Simpan Perubahan'}
        </button>
      </div>
    </form>
  )
}