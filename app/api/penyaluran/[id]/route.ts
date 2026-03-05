// app/api/penyaluran/[id]/route.ts
// GET    → detail penyaluran by id
// PUT    → edit penyaluran
// DELETE → hapus penyaluran

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const penyaluran = await prisma.penyaluran.findUnique({
      where: { id },
      include: {
        bansos: {
          include: {
            penduduk: { select: { nama: true, nik: true } },
          },
        },
      },
    })

    if (!penyaluran) {
      return NextResponse.json({ error: 'Penyaluran tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: penyaluran })
  } catch (err) {
    console.error('[GET /api/penyaluran/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { tanggal, nominal, keterangan } = body

    const existing = await prisma.penyaluran.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Penyaluran tidak ditemukan' }, { status: 404 })
    }

    const penyaluran = await prisma.penyaluran.update({
      where: { id },
      data: {
        ...(tanggal && { tanggal: new Date(tanggal) }),
        ...(nominal !== undefined && { nominal: parseFloat(nominal) }),
        ...(keterangan !== undefined && { keterangan: keterangan || null }),
      },
    })

    return NextResponse.json({ success: true, data: penyaluran })
  } catch (err) {
    console.error('[PUT /api/penyaluran/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.penyaluran.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Penyaluran tidak ditemukan' }, { status: 404 })
    }

    await prisma.penyaluran.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Penyaluran berhasil dihapus' })
  } catch (err) {
    console.error('[DELETE /api/penyaluran/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}