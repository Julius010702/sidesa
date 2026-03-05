import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { kartuKeluargaSchema } from '@/lib/validations'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

// GET /api/kartu-keluarga/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const kk = await prisma.kartuKeluarga.findUnique({
      where: { id },
      include: {
        anggota: {
          where: { statusHidup: true },
          orderBy: { nama: 'asc' },
          select: {
            id: true,
            nama: true,
            nik: true,
            jenisKelamin: true,
            tempatLahir: true,
            tanggalLahir: true,
            agama: true,
            pendidikan: true,
            pekerjaan: true,
            statusKawin: true,      // ✅ fix: was statusPerkawinan
            statusHidup: true,
            // ❌ hubunganDenganKepala tidak ada di schema Penduduk
          },
        },
        _count: { select: { anggota: true } },
      },
    })

    if (!kk) {
      return NextResponse.json({ error: 'Kartu Keluarga tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: kk })
  } catch (error) {
    console.error('[KK GET BY ID ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PATCH /api/kartu-keluarga/[id]
export async function PATCH(
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

    const existing = await prisma.kartuKeluarga.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'KK tidak ditemukan' }, { status: 404 })
    }

    const parsed = kartuKeluargaSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const updated = await prisma.kartuKeluarga.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[KK PATCH ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE /api/kartu-keluarga/[id]
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

    const kk = await prisma.kartuKeluarga.findUnique({
      where: { id },
      include: { _count: { select: { anggota: true } } },
    })

    if (!kk) {
      return NextResponse.json({ error: 'KK tidak ditemukan' }, { status: 404 })
    }

    if (kk._count.anggota > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus KK yang masih memiliki anggota aktif' },
        { status: 400 }
      )
    }

    await prisma.kartuKeluarga.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Kartu Keluarga berhasil dihapus' })
  } catch (error) {
    console.error('[KK DELETE ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}