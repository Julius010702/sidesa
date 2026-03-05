import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { kartuKeluargaSchema } from '@/lib/validations'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

// GET /api/kartu-keluarga
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
    const search = searchParams.get('q') ?? ''
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { noKK: { contains: search } },
            { namaKepala: { contains: search, mode: 'insensitive' as const } },
            { alamat: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [data, total] = await Promise.all([
      prisma.kartuKeluarga.findMany({
        where,
        orderBy: { namaKepala: 'asc' },
        skip,
        take: limit,
        include: {
          _count: { select: { anggota: true } },
        },
      }),
      prisma.kartuKeluarga.count({ where }),
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
    console.error('[KK GET ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// POST /api/kartu-keluarga
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = kartuKeluargaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const existing = await prisma.kartuKeluarga.findUnique({
      where: { noKK: parsed.data.noKK },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Nomor KK sudah terdaftar' },
        { status: 409 }
      )
    }

    const kk = await prisma.kartuKeluarga.create({ data: parsed.data })

    return NextResponse.json(
      { success: true, message: 'Kartu Keluarga berhasil ditambahkan', data: kk },
      { status: 201 }
    )
  } catch (error) {
    console.error('[KK POST ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}