import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const mine = searchParams.get('mine') === 'true'
    const status = searchParams.get('status') ?? ''
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (mine) {
      const penduduk = await prisma.penduduk.findUnique({
        where: { userId: session.userId }, // ✅ fix: session.userId bukan session.id
        select: { id: true },
      })
      if (!penduduk) return NextResponse.json({ success: true, data: [] })
      where.pendudukId = penduduk.id
    }

    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.bansos.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
        include: {
          penduduk: { select: { id: true, nama: true, nik: true, alamat: true } },
          penyaluran: { orderBy: { tanggal: 'desc' } },
        },
      }),
      prisma.bansos.count({ where }),
    ])

    return NextResponse.json({ success: true, data, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('[BANSOS GET]', error)
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
    const { pendudukId, jenisBansos, tahun, nominal, keterangan, tanggalMulai, tanggalAkhir } = body

    if (!pendudukId || !jenisBansos || !tahun) {
      return NextResponse.json({ error: 'pendudukId, jenisBansos, dan tahun wajib diisi' }, { status: 400 })
    }

    const bansos = await prisma.bansos.create({
      data: {
        pendudukId,
        jenisBansos,
        tahun: parseInt(tahun),
        nominal: nominal ? parseFloat(nominal) : null,
        keterangan: keterangan || null,
        tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null,
        tanggalAkhir: tanggalAkhir ? new Date(tanggalAkhir) : null,
        status: 'AKTIF',
      },
    })

    return NextResponse.json({ success: true, data: bansos }, { status: 201 })
  } catch (error) {
    console.error('[BANSOS POST]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}