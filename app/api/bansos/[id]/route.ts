import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const bansos = await prisma.bansos.findUnique({
      where: { id },
      include: { penduduk: true, penyaluran: { orderBy: { tanggal: 'desc' } } },
    })
    if (!bansos) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ success: true, data: bansos })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const updated = await prisma.bansos.update({
      where: { id },
      data: {
        status: body.status,
        nominal: body.nominal,
        keterangan: body.keterangan,
        tanggalMulai: body.tanggalMulai ? new Date(body.tanggalMulai) : undefined,
        tanggalAkhir: body.tanggalAkhir ? new Date(body.tanggalAkhir) : undefined,
      },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    await prisma.bansos.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}