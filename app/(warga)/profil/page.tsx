'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
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
          <Avatar name={user.nama} src={user.fotoUrl} size="xl" />
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