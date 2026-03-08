// app/api/penduduk/route.ts  — GANTI SELURUH FILE dengan ini
// Menambahkan auto-link ke User jika NIK sudah terdaftar sebagai warga

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import type { Prisma } from '@prisma/client'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

const agamaMap: Record<string, string> = {
  Islam: 'ISLAM', Kristen: 'KRISTEN', Katolik: 'KATOLIK',
  Hindu: 'HINDU', Buddha: 'BUDDHA', Konghucu: 'KONGHUCU',
}

// ─────────────────────────────────────────────
// GET → list penduduk (admin)
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 20
    const skip = (page - 1) * limit

    const where = q
      ? {
          OR: [
            { nama: { contains: q, mode: 'insensitive' as const } },
            { nik: { contains: q } },
            { noKK: { contains: q } },
            { alamat: { contains: q, mode: 'insensitive' as const } },
          ],
          statusHidup: true,
        }
      : { statusHidup: true }

    const [data, total] = await Promise.all([
      prisma.penduduk.findMany({ where, orderBy: { nama: 'asc' }, skip, take: limit }),
      prisma.penduduk.count({ where }),
    ])

    return NextResponse.json({ success: true, data, total, totalPages: Math.ceil(total / limit), page })
  } catch (err) {
    console.error('[GET /api/penduduk]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────
// POST → tambah penduduk baru (admin)
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      nik, noKK, nama, jenisKelamin, tempatLahir, tanggalLahir,
      agama, pendidikan, pekerjaan, statusPerkawinan,
      alamat, rt, rw, kelurahan, kecamatan, kabupaten, provinsi,
    } = body

    // Validasi wajib
    if (!nik || nik.length !== 16)         return NextResponse.json({ error: 'NIK harus 16 digit' }, { status: 400 })
    if (!noKK || noKK.length !== 16)       return NextResponse.json({ error: 'No. KK harus 16 digit' }, { status: 400 })
    if (!nama?.trim())                     return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
    if (!jenisKelamin)                     return NextResponse.json({ error: 'Jenis kelamin wajib diisi' }, { status: 400 })
    if (!tanggalLahir)                     return NextResponse.json({ error: 'Tanggal lahir wajib diisi' }, { status: 400 })
    if (!agama)                            return NextResponse.json({ error: 'Agama wajib diisi' }, { status: 400 })
    if (!statusPerkawinan)                 return NextResponse.json({ error: 'Status perkawinan wajib diisi' }, { status: 400 })
    if (!alamat?.trim())                   return NextResponse.json({ error: 'Alamat wajib diisi' }, { status: 400 })

    // Cek NIK duplikat
    const existingPenduduk = await prisma.penduduk.findUnique({ where: { nik } })
    if (existingPenduduk) return NextResponse.json({ error: 'NIK sudah terdaftar sebagai penduduk' }, { status: 400 })

    // ✅ Cek apakah ada User dengan NIK ini (warga sudah daftar tapi belum diverifikasi)
    const existingUser = await prisma.user.findUnique({ where: { nik } })

    // Pastikan KartuKeluarga ada
    const kkExist = await prisma.kartuKeluarga.findUnique({ where: { noKK } })
    if (!kkExist) {
      await prisma.kartuKeluarga.create({
        data: {
          noKK, namaKepala: nama,
          alamat: alamat || '', rt: rt || '', rw: rw || '',
          kelurahan: kelurahan || '', kecamatan: kecamatan || '',
          kabupaten: kabupaten || '', provinsi: provinsi || '',
        },
      })
    }

    const jenisKelaminEnum = jenisKelamin === 'L' ? 'LAKI_LAKI' : 'PEREMPUAN'
    const agamaEnum = agamaMap[agama] || agama.toUpperCase()

    // ✅ Transaksi: buat penduduk + update user jika NIK sudah terdaftar
    const penduduk = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.penduduk.create({
        data: {
          nik, noKK,
          nama: nama.trim(),
          jenisKelamin: jenisKelaminEnum as never,
          tempatLahir: tempatLahir?.trim() || '',
          tanggalLahir: new Date(tanggalLahir),
          agama: agamaEnum as never,
          pendidikan: pendidikan || null,
          pekerjaan: pekerjaan || null,
          statusKawin: statusPerkawinan as never,
          alamat: alamat.trim(),
          rt: rt || '', rw: rw || '',
          kelurahan: kelurahan || '', kecamatan: kecamatan || '',
          kabupaten: kabupaten || '', provinsi: provinsi || '',
          // ✅ Jika ada user dengan NIK sama, langsung link
          userId: existingUser?.id ?? session.userId,
        },
      })

      // ✅ Jika ada user yang sudah daftar, verifikasi otomatis
      if (existingUser) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: { isVerified: true },
        })

        await tx.notifikasi.create({
          data: {
            userId: existingUser.id,
            judul: 'Akun Terhubung ke Data Kependudukan',
            pesan: `Data kependudukan Anda atas nama ${nama.trim()} telah ditambahkan oleh admin. Akun Anda kini aktif.`,
            tipe: 'AKUN',
          },
        })
      }

      return created
    })

    return NextResponse.json(
      {
        success: true,
        data: penduduk,
        autoLinked: !!existingUser,
        message: existingUser
          ? `Data berhasil ditambahkan dan otomatis terhubung ke akun ${existingUser.email}`
          : 'Data penduduk berhasil ditambahkan',
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/penduduk]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}