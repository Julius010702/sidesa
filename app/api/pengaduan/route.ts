import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { pengaduanSchema } from '@/lib/validations'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

// GET /api/pengaduan
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))
    const status = searchParams.get('status')
    const kategori = searchParams.get('kategori')
    const skip = (page - 1) * limit

    const isAdmin = ADMIN_ROLES.includes(session.role)

    const where = {
      ...(isAdmin ? {} : { userId: session.userId }),
      ...(status ? { status: status as never } : {}),
      ...(kategori ? { kategori: kategori as never } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.pengaduan.findMany({
        where,
        orderBy: { tanggalLapor: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, nama: true, nik: true, noHp: true } },
        },
      }),
      prisma.pengaduan.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[PENGADUAN GET ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// POST /api/pengaduan
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = pengaduanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { judul, deskripsi, kategori, lokasi } = parsed.data

    const pengaduan = await prisma.pengaduan.create({
      data: {
        userId: session.userId,
        judul,
        deskripsi,
        kategori,
        lokasi,
        status: 'DITERIMA',
        prioritas: 3,
        tanggalLapor: new Date(),
      },
    })

    // Notifikasi konfirmasi ke pelapor
    await prisma.notifikasi.create({
      data: {
        userId: session.userId,
        judul: 'Pengaduan Diterima',
        pesan: `Pengaduan "${judul}" Anda telah diterima dan akan segera ditindaklanjuti.`,
        tipe: 'PENGADUAN',
        refId: pengaduan.id,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Pengaduan berhasil dikirim', data: pengaduan },
      { status: 201 }
    )
  } catch (error) {
    console.error('[PENGADUAN POST ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}