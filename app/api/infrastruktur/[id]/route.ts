import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/infrastruktur/[id]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const item = await prisma.infrastruktur.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('[GET /api/infrastruktur/[id]]', error)
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 })
  }
}

// PATCH /api/infrastruktur/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Tidak diizinkan' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await prisma.infrastruktur.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 })
    }

    const updated = await prisma.infrastruktur.update({
      where: { id },
      data: {
        nama: body.nama ?? existing.nama,
        kategori: body.kategori ?? existing.kategori,
        lokasi: body.lokasi ?? existing.lokasi,
        deskripsi: body.deskripsi !== undefined ? (body.deskripsi || null) : existing.deskripsi,
        kondisi: body.kondisi ?? existing.kondisi,
        status: body.status ?? existing.status,
        catatan: body.catatan !== undefined ? (body.catatan || null) : existing.catatan,
        foto: body.foto !== undefined ? (body.foto || null) : existing.foto, // ← field foto ikut update
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[PATCH /api/infrastruktur/[id]]', error)
    return NextResponse.json({ success: false, error: 'Gagal mengupdate data' }, { status: 500 })
  }
}

// DELETE /api/infrastruktur/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Tidak diizinkan' }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.infrastruktur.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 })
    }

    await prisma.infrastruktur.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' })
  } catch (error) {
    console.error('[DELETE /api/infrastruktur/[id]]', error)
    return NextResponse.json({ success: false, error: 'Gagal menghapus data' }, { status: 500 })
  }
}