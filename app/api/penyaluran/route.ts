import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const limit = parseInt(new URL(req.url).searchParams.get('limit') ?? '20')
    const data = await prisma.penyaluran.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      include: { bansos: { include: { penduduk: { select: { nama: true } } } } },
    })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { bansosId, tanggal, nominal, keterangan } = await req.json()
    if (!bansosId || !tanggal || !nominal) return NextResponse.json({ error: 'bansosId, tanggal, nominal wajib' }, { status: 400 })
    const penyaluran = await prisma.penyaluran.create({
      data: { bansosId, tanggal: new Date(tanggal), nominal: parseFloat(nominal), keterangan: keterangan || null },
    })
    return NextResponse.json({ success: true, data: penyaluran }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}