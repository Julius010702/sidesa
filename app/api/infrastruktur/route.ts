import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''
    const where = q ? { OR: [{ nama: { contains: q, mode: 'insensitive' as const } }, { lokasi: { contains: q, mode: 'insensitive' as const } }] } : {}
    const data = await prisma.infrastruktur.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await req.json()
    const { nama, kategori, lokasi, deskripsi, kondisi, foto, catatan } = body
    if (!nama || !kategori || !lokasi || !kondisi) return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 })
    const item = await prisma.infrastruktur.create({
      data: { nama, kategori, lokasi, deskripsi: deskripsi || null, kondisi, foto: foto || null, catatan: catatan || null },
    })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
