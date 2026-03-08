'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import { toast } from '@/components/ui/Toast'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ProfilData {
  user: {
    id: string
    nama: string
    email: string
    noHp?: string | null
    fotoUrl?: string | null
    role: string
    createdAt: string
  }
  penduduk?: {
    nik: string
    noKK: string
    tempatLahir: string
    tanggalLahir: string
    jenisKelamin: string
    agama: string
    statusKawin: string
    pekerjaan?: string | null
    pendidikan?: string | null
    golonganDarah?: string | null
    alamat: string
    rt: string
    rw: string
    kelurahan: string
    kecamatan: string
    kabupaten: string
    provinsi: string
    kodePos?: string | null
  } | null
}

export default function ProfilPage() {
  const [data, setData] = useState<ProfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ nama: '', noHp: '' })
  const [pwForm, setPwForm] = useState({ passwordLama: '', passwordBaru: '', konfirmasi: '' })
  const [showPw, setShowPw] = useState(false)

  // Foto upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [showFotoMenu, setShowFotoMenu] = useState(false)

  useEffect(() => {
    fetch('/api/profil')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setForm({ nama: d.user.nama, noHp: d.user.noHp || '' })
      })
      .catch(() => toast.error('Gagal memuat data profil'))
      .finally(() => setLoading(false))
  }, [])

  // Tutup menu foto saat klik di luar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-foto-menu]')) {
        setShowFotoMenu(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview lokal
    const reader = new FileReader()
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploadingFoto(true)
    setShowFotoMenu(false)
    try {
      const formData = new FormData()
      formData.append('foto', file)

      const res = await fetch('/api/profil/foto', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Gagal mengupload foto')
        setFotoPreview(null)
        return
      }

      setData(d => d ? { ...d, user: { ...d.user, fotoUrl: result.fotoUrl } } : d)
      setFotoPreview(null)
      toast.success('Foto profil berhasil diperbarui!')
    } catch {
      toast.error('Terjadi kesalahan saat upload')
      setFotoPreview(null)
    } finally {
      setUploadingFoto(false)
      // Reset input agar bisa upload file yang sama lagi
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleHapusFoto() {
    setShowFotoMenu(false)
    if (!confirm('Hapus foto profil?')) return
    setUploadingFoto(true)
    try {
      const res = await fetch('/api/profil/foto', { method: 'DELETE' })
      if (res.ok) {
        setData(d => d ? { ...d, user: { ...d.user, fotoUrl: null } } : d)
        toast.success('Foto profil dihapus')
      }
    } catch {
      toast.error('Gagal menghapus foto')
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleSaveProfil = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setData(d => d ? { ...d, user: { ...d.user, ...updated } } : d)
      toast.success('Profil berhasil diperbarui!')
      setEditMode(false)
    } catch {
      toast.error('Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (pwForm.passwordBaru !== pwForm.konfirmasi) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
    if (pwForm.passwordBaru.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/profil/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordLama: pwForm.passwordLama, passwordBaru: pwForm.passwordBaru }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Gagal')
      }
      toast.success('Password berhasil diubah!')
      setPwForm({ passwordLama: '', passwordBaru: '', konfirmasi: '' })
      setShowPw(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengubah password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )

  if (!data) return null

  const { user, penduduk } = data
  const currentFoto = fotoPreview || user.fotoUrl

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola informasi akun dan data kependudukan Anda</p>
      </div>

      {/* Kartu identitas utama */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar dengan tombol upload */}
          <div className="relative" data-foto-menu>
            {/* Foto / Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-md shrink-0">
              {currentFoto ? (
                <Image
                  src={currentFoto}
                  alt={user.nama}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Loading overlay */}
              {uploadingFoto && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Tombol edit foto */}
            <button
              onClick={() => setShowFotoMenu(v => !v)}
              disabled={uploadingFoto}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
              title="Ubah foto profil"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Dropdown menu foto */}
            {showFotoMenu && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => { setShowFotoMenu(false); fileInputRef.current?.click() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upload Foto Baru
                </button>
                {user.fotoUrl && (
                  <button
                    onClick={handleHapusFoto}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Foto
                  </button>
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFotoChange}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-gray-900 text-lg">{user.nama}</h2>
              <Badge variant="green" dot>{user.role === 'WARGA' ? 'Warga' : user.role}</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
            {user.noHp && <p className="text-sm text-gray-500">{user.noHp}</p>}
            <p className="text-xs text-gray-400 mt-2">
              Bergabung sejak {format(new Date(user.createdAt), 'd MMMM yyyy', { locale: id })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Klik ikon kamera untuk mengubah foto profil
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditMode(e => !e)}>
            {editMode ? 'Batal' : '✏️ Edit Profil'}
          </Button>
        </div>

        {/* Form edit */}
        {editMode && (
          <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                value={form.nama}
                onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                required
              />
              <Input
                label="No. HP / WhatsApp"
                value={form.noHp}
                onChange={e => setForm(f => ({ ...f, noHp: e.target.value }))}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditMode(false)}>Batal</Button>
              <Button onClick={handleSaveProfil} loading={saving}>Simpan Perubahan</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Data Kependudukan */}
      {penduduk ? (
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Data Kependudukan</h3>
            <Badge variant="green" dot>Terverifikasi</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              { label: 'NIK', value: penduduk.nik },
              { label: 'No. KK', value: penduduk.noKK },
              { label: 'Tempat Lahir', value: penduduk.tempatLahir },
              { label: 'Tanggal Lahir', value: format(new Date(penduduk.tanggalLahir), 'd MMMM yyyy', { locale: id }) },
              { label: 'Jenis Kelamin', value: penduduk.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan' },
              { label: 'Agama', value: penduduk.agama },
              { label: 'Status Kawin', value: penduduk.statusKawin.replace('_', ' ') },
              { label: 'Pekerjaan', value: penduduk.pekerjaan || '-' },
              { label: 'Pendidikan', value: penduduk.pendidikan || '-' },
              { label: 'Golongan Darah', value: penduduk.golonganDarah || '-' },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-gray-50">
            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Alamat</p>
            <p className="text-sm text-gray-800">
              {penduduk.alamat}, RT {penduduk.rt}/RW {penduduk.rw}, {penduduk.kelurahan}, Kec. {penduduk.kecamatan}, {penduduk.kabupaten}, {penduduk.provinsi} {penduduk.kodePos || ''}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-6 text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm font-medium text-gray-600">Data kependudukan belum tersedia</p>
            <p className="text-xs mt-1">Hubungi kantor desa untuk melengkapi data Anda</p>
          </div>
        </Card>
      )}

      {/* Ubah Password */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Keamanan Akun</h3>
            <p className="text-sm text-gray-500 mt-0.5">Ubah password untuk menjaga keamanan akun Anda</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowPw(s => !s)}>
            {showPw ? 'Batal' : '🔒 Ubah Password'}
          </Button>
        </div>

        {showPw && (
          <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col gap-4">
            <Input
              label="Password Lama"
              type="password"
              value={pwForm.passwordLama}
              onChange={e => setPwForm(f => ({ ...f, passwordLama: e.target.value }))}
              required
            />
            <Input
              label="Password Baru"
              type="password"
              value={pwForm.passwordBaru}
              onChange={e => setPwForm(f => ({ ...f, passwordBaru: e.target.value }))}
              hint="Minimal 6 karakter"
              required
            />
            <Input
              label="Konfirmasi Password Baru"
              type="password"
              value={pwForm.konfirmasi}
              onChange={e => setPwForm(f => ({ ...f, konfirmasi: e.target.value }))}
              required
            />
            <div className="flex justify-end">
              <Button onClick={handleChangePassword} loading={saving}>Simpan Password</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}