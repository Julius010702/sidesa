'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface UserItem {
  id: string
  nik: string
  nama: string
  email: string
  noHp: string | null
  role: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  penduduk: {
    id: string
    nama: string
    nik: string
    alamat: string
    keterangan: string | null
  } | null
}

type Tab = 'incomplete' | 'all'

// Cek apakah data penduduk masih placeholder (belum dilengkapi)
function isDataIncomplete(user: UserItem): boolean {
  if (!user.penduduk) return false
  return user.penduduk.keterangan?.includes('belum lengkap') ?? false
}

export default function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>('incomplete')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    // Tampilkan semua user, kita filter di frontend
    if (search) params.set('q', search)
    try {
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    void fetchUsers()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleVerify(userId: string) {
    setProcessingId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'verify' }),
      })
      const data = await res.json()
      if (data.success) await fetchUsers()
      else alert(data.error || 'Gagal memverifikasi')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleToggleActive(userId: string) {
    setProcessingId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'toggle_active' }),
      })
      const data = await res.json()
      if (data.success) await fetchUsers()
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDelete(userId: string, nama: string) {
    if (!confirm(`Hapus akun "${nama}"?\n\nData kependudukan yang terhubung juga akan ikut dihapus. Tindakan ini tidak bisa dibatalkan.`)) return
    setProcessingId(userId)
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) await fetchUsers()
      else alert(data.error || 'Gagal menghapus akun')
    } finally {
      setProcessingId(null)
    }
  }

  // Filter berdasarkan tab
  const filteredUsers = users.filter((u) => {
    if (tab === 'incomplete') return isDataIncomplete(u) || !u.isVerified
    return true
  })

  const incompleteCount = users.filter((u) => isDataIncomplete(u) || !u.isVerified).length

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Warga yang mendaftar otomatis terdaftar sebagai penduduk — lengkapi data mereka di menu Data Penduduk
        </p>
        <div className="mt-4 h-px bg-linear-to-r from-blue-100 via-gray-100 to-transparent" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('incomplete')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'incomplete' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Perlu Tindakan
          {incompleteCount > 0 && (
            <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {incompleteCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Semua Pengguna
          <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {users.length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Cari nama, NIK, atau email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={fetchUsers} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          Cari
        </button>
      </div>

      {/* Info banner */}
      {tab === 'incomplete' && !loading && incompleteCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <span className="text-xl shrink-0">ℹ️</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">
              {incompleteCount} warga perlu tindakan admin
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Warga sudah terdaftar sebagai penduduk secara otomatis dengan data minimal.
              Klik <b>Lengkapi Data</b> untuk mengisi data kependudukan lengkap mereka, lalu <b>Verifikasi</b> akunnya.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-500 font-medium">
            {tab === 'incomplete' ? 'Semua data sudah lengkap dan terverifikasi' : 'Belum ada pengguna terdaftar'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Header kolom */}
          <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama / NIK</div>
            <div className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</div>
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Status Akun</div>
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Data Penduduk</div>
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user) => {
              const incomplete = isDataIncomplete(user)
              return (
                <div key={user.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-3 px-5 py-4 items-start transition-colors ${
                  incomplete ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-gray-50/50'
                }`}>
                  {/* Nama & NIK */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{user.nama}</p>
                      {incomplete && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                          Perlu dilengkapi
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{user.nik}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Daftar: {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="lg:col-span-3">
                    <p className="text-sm text-gray-700 break-all">{user.email}</p>
                    {user.noHp && <p className="text-xs text-gray-400 mt-0.5">{user.noHp}</p>}
                  </div>

                  {/* Status Akun */}
                  <div className="lg:col-span-2 flex flex-col gap-1.5">
                    <span className={`inline-flex w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${
                      user.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {user.isVerified ? '✓ Terverifikasi' : '⏳ Belum diverifikasi'}
                    </span>
                    <span className={`inline-flex w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${
                      user.isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  {/* Data Penduduk */}
                  <div className="lg:col-span-2">
                    {user.penduduk ? (
                      <div className={`border rounded-lg p-2 ${
                        incomplete
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <p className={`text-xs font-semibold ${incomplete ? 'text-amber-800' : 'text-green-800'}`}>
                          {incomplete ? '⚠ Data belum lengkap' : '✓ Data lengkap'}
                        </p>
                        <p className={`text-xs truncate mt-0.5 ${incomplete ? 'text-amber-700' : 'text-green-700'}`}>
                          ID: {user.penduduk.id.slice(0, 8)}...
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                        <p className="text-xs font-semibold text-red-700">✕ Tidak ada data</p>
                      </div>
                    )}
                  </div>

                  {/* Aksi */}
                  <div className="lg:col-span-2 flex flex-col gap-1.5">
                    {/* Tombol lengkapi data — arahkan ke halaman edit penduduk */}
                    {user.penduduk && incomplete && (
                      <Link
                        href={`/admin/penduduk/${user.penduduk.id}/edit`}
                        className="text-xs font-semibold px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-center"
                      >
                        ✏️ Lengkapi Data
                      </Link>
                    )}

                    {/* Verifikasi akun */}
                    {!user.isVerified && (
                      <button
                        disabled={processingId === user.id}
                        onClick={() => handleVerify(user.id)}
                        className="text-xs font-semibold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        ✓ Verifikasi Akun
                      </button>
                    )}

                    {/* Lihat detail penduduk */}
                    {user.penduduk && (
                      <Link
                        href={`/admin/penduduk/${user.penduduk.id}`}
                        className="text-xs font-semibold px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center"
                      >
                        👁 Lihat Data
                      </Link>
                    )}

                    {/* Aktif/nonaktif */}
                    <button
                      disabled={processingId === user.id}
                      onClick={() => handleToggleActive(user.id)}
                      className="text-xs font-semibold px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>

                    {/* Hapus akun */}
                    <button
                      disabled={processingId === user.id}
                      onClick={() => handleDelete(user.id, user.nama)}
                      className="text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      🗑 Hapus
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}