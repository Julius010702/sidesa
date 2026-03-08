'use client'

import { useEffect, useState, useCallback } from 'react'

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
  penduduk: { id: string; nama: string; nik: string; alamat: string } | null
}

type Tab = 'unverified' | 'all'

export default function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>('unverified')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Modal state for linking
  const [linkModal, setLinkModal] = useState<{ open: boolean; user: UserItem | null }>({
    open: false,
    user: null,
  })
  const [linkNik, setLinkNik] = useState('')
  const [linkError, setLinkError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tab === 'unverified') params.set('filter', 'unverified')
    if (search) params.set('q', search)

    try {
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } finally {
      setLoading(false)
    }
  }, [tab, search])

  // Re-fetch when tab changes; search is triggered manually via button/Enter
  useEffect(() => {
    void fetchUsers()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAction(userId: string, action: string, extra?: Record<string, string>) {
    setProcessingId(userId)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, ...extra }),
    })
    const data = await res.json()
    if (data.success) {
      await fetchUsers()
    } else {
      alert(data.error || 'Gagal melakukan aksi')
    }
    setProcessingId(null)
  }

  async function handleLink() {
    if (!linkModal.user) return
    if (!linkNik || linkNik.length !== 16) {
      setLinkError('NIK harus 16 digit')
      return
    }
    setLinkError('')
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: linkModal.user.id,
        action: 'link',
        pendudukNik: linkNik,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setLinkModal({ open: false, user: null })
      setLinkNik('')
      await fetchUsers()
    } else {
      setLinkError(data.error || 'Gagal menghubungkan')
    }
  }

  const unverifiedCount = users.filter((u) => !u.isVerified).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Verifikasi warga yang mendaftar dan hubungkan ke data kependudukan
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('unverified')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'unverified'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Perlu Verifikasi
          {unverifiedCount > 0 && (
            <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {unverifiedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Semua Pengguna
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
            placeholder="Cari nama, NIK, atau email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          />
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Cari
        </button>
      </div>

      {/* Info box for unverified tab */}
      {tab === 'unverified' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Warga mendaftar tapi NIK belum ada di database penduduk</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Anda bisa: (1) <b>Hubungkan</b> ke data penduduk yang sudah ada, atau (2) <b>Tambah</b> data penduduknya dulu di menu Penduduk, lalu sistem akan otomatis menghubungkan.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-500 font-medium">
            {tab === 'unverified' ? 'Tidak ada warga yang perlu diverifikasi' : 'Tidak ada pengguna'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama / NIK</div>
            <div className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</div>
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</div>
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Data Penduduk</div>
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</div>
          </div>

          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 items-start hover:bg-gray-50/50 transition-colors">
                {/* Nama & NIK */}
                <div className="md:col-span-3">
                  <p className="text-sm font-bold text-gray-900">{user.nama}</p>
                  <p className="text-xs font-mono text-gray-400">{user.nik}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(user.createdAt).toLocaleDateString('id-ID')}</p>
                </div>

                {/* Email */}
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-700">{user.email}</p>
                  {user.noHp && <p className="text-xs text-gray-400">{user.noHp}</p>}
                </div>

                {/* Status */}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <span className={`inline-flex w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${
                    user.isVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {user.isVerified ? '✓ Terverifikasi' : '⏳ Pending'}
                  </span>
                  <span className={`inline-flex w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${
                    user.isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Data Penduduk */}
                <div className="md:col-span-2">
                  {user.penduduk ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <p className="text-xs font-semibold text-green-800">✓ Terhubung</p>
                      <p className="text-xs text-green-700 truncate">{user.penduduk.nama}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Belum terhubung</p>
                    </div>
                  )}
                </div>

                {/* Aksi */}
                <div className="md:col-span-2 flex flex-col gap-1.5 items-end">
                  {!user.isVerified && (
                    <>
                      <button
                        disabled={processingId === user.id}
                        onClick={() => handleAction(user.id, 'verify')}
                        className="w-full text-xs font-semibold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        ✓ Verifikasi
                      </button>
                      <button
                        disabled={processingId === user.id}
                        onClick={() => {
                          setLinkModal({ open: true, user })
                          setLinkNik(user.nik)
                          setLinkError('')
                        }}
                        className="w-full text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        🔗 Hubungkan ke Penduduk
                      </button>
                      <button
                        disabled={processingId === user.id}
                        onClick={() => handleAction(user.id, 'reject')}
                        className="w-full text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        ✕ Tolak
                      </button>
                    </>
                  )}
                  {user.isVerified && !user.penduduk && (
                    <button
                      disabled={processingId === user.id}
                      onClick={() => {
                        setLinkModal({ open: true, user })
                        setLinkNik(user.nik)
                        setLinkError('')
                      }}
                      className="w-full text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      🔗 Hubungkan
                    </button>
                  )}
                  <button
                    disabled={processingId === user.id}
                    onClick={() => handleAction(user.id, 'toggle_active')}
                    className="w-full text-xs font-semibold px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link Modal */}
      {linkModal.open && linkModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Hubungkan ke Data Penduduk</h3>
            <p className="text-sm text-gray-500 mb-5">
              Masukkan NIK data penduduk yang akan dihubungkan ke akun <b>{linkModal.user.nama}</b>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  NIK Penduduk <span className="text-red-500">*</span>
                </label>
                <input
                  value={linkNik}
                  onChange={(e) => {
                    setLinkNik(e.target.value)
                    setLinkError('')
                  }}
                  placeholder="16 digit NIK"
                  maxLength={16}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    linkError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {linkError && <p className="text-xs text-red-600 mt-1">{linkError}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  NIK warga: <span className="font-mono font-semibold">{linkModal.user.nik}</span> (bisa gunakan NIK yang sama jika sudah ada di data penduduk)
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                Setelah dihubungkan: akun warga akan diverifikasi otomatis dan dapat mengakses bansos, surat, serta layanan lainnya.
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setLinkModal({ open: false, user: null })
                  setLinkNik('')
                  setLinkError('')
                }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLink}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Hubungkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}