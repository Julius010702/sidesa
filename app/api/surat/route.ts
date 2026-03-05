import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ajukanSuratSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const adminRoles = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']
    const isAdmin = adminRoles.includes(session.role)

    const where = {
      ...(isAdmin ? {} : { userId: session.userId }),
      ...(status ? { status: status as never } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.surat.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, nama: true, nik: true, noHp: true, email: true } },
        },
      }),
      prisma.surat.count({ where }),
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
    console.error('[SURAT GET ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = ajukanSuratSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { jenisSurat, keperluan } = parsed.data

    const surat = await prisma.surat.create({
      data: {
        userId: session.userId,
        jenisSurat,
        keperluan,
        status: 'PENDING',
        tanggalDiajukan: new Date(),
      },
    })

    await prisma.notifikasi.create({
      data: {
        userId: session.userId,
        judul: 'Pengajuan Surat Diterima',
        pesan: `Pengajuan surat ${jenisSurat.replace(/_/g, ' ')} Anda telah diterima dan sedang menunggu diproses.`,
        tipe: 'SURAT',
        refId: surat.id,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Surat berhasil diajukan', data: surat },
      { status: 201 }
    )
  } catch (error) {
    console.error('[SURAT POST ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}