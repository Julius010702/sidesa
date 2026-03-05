// app/api/penduduk/route.ts
// GET  → list penduduk (admin)
// POST → tambah penduduk baru (admin)

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

const agamaMap: Record<string, string> = {
  Islam: 'ISLAM', Kristen: 'KRISTEN', Katolik: 'KATOLIK',
  Hindu: 'HINDU', Buddha: 'BUDDHA', Konghucu: 'KONGHUCU',
}

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
      prisma.penduduk.findMany({
        where,
        orderBy: { nama: 'asc' },
        skip,
        take: limit,
      }),
      prisma.penduduk.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    })
  } catch (err) {
    console.error('[GET /api/penduduk]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

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
    if (!nik || nik.length !== 16) return NextResponse.json({ error: 'NIK harus 16 digit' }, { status: 400 })
    if (!noKK || noKK.length !== 16) return NextResponse.json({ error: 'No. KK harus 16 digit' }, { status: 400 })
    if (!nama?.trim()) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
    if (!jenisKelamin) return NextResponse.json({ error: 'Jenis kelamin wajib diisi' }, { status: 400 })
    if (!tanggalLahir) return NextResponse.json({ error: 'Tanggal lahir wajib diisi' }, { status: 400 })
    if (!agama) return NextResponse.json({ error: 'Agama wajib diisi' }, { status: 400 })
    if (!statusPerkawinan) return NextResponse.json({ error: 'Status perkawinan wajib diisi' }, { status: 400 })
    if (!alamat?.trim()) return NextResponse.json({ error: 'Alamat wajib diisi' }, { status: 400 })

    // Cek NIK duplikat
    const existing = await prisma.penduduk.findUnique({ where: { nik } })
    if (existing) return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 })

    // Pastikan KartuKeluarga ada, kalau belum buat
    const kkExist = await prisma.kartuKeluarga.findUnique({ where: { noKK } })
    if (!kkExist) {
      await prisma.kartuKeluarga.create({
        data: {
          noKK,
          namaKepala: nama,
          alamat: alamat || '',
          rt: rt || '',
          rw: rw || '',
          kelurahan: kelurahan || '',
          kecamatan: kecamatan || '',
          kabupaten: kabupaten || '',
          provinsi: provinsi || '',
        },
      })
    }

    // Map nilai enum
    const jenisKelaminEnum = jenisKelamin === 'L' ? 'LAKI_LAKI' : 'PEREMPUAN'
    const agamaEnum = agamaMap[agama] || agama.toUpperCase()

    const penduduk = await prisma.penduduk.create({
      data: {
        nik,
        noKK,
        nama: nama.trim(),
        jenisKelamin: jenisKelaminEnum as never,
        tempatLahir: tempatLahir?.trim() || '',
        tanggalLahir: new Date(tanggalLahir),
        agama: agamaEnum as never,
        pendidikan: pendidikan || null,
        pekerjaan: pekerjaan || null,
        statusKawin: statusPerkawinan as never,
        alamat: alamat.trim(),
        rt: rt || '',
        rw: rw || '',
        kelurahan: kelurahan || '',
        kecamatan: kecamatan || '',
        kabupaten: kabupaten || '',
        provinsi: provinsi || '',
        userId: session.userId,
      },
    })

    return NextResponse.json({ success: true, data: penduduk }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/penduduk]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}