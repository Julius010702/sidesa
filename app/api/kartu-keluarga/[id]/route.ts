// app/api/kartu-keluarga/[id]/route.ts

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
            statusKawin: true,
            statusHidup: true,
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
// Menghapus KK + nonaktifkan semua bansos seluruh anggota KK tersebut
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
      include: {
        // Cek anggota aktif saja
        anggota: {
          where: { statusHidup: true },
          select: { id: true },
        },
      },
    })

    if (!kk) {
      return NextResponse.json({ error: 'KK tidak ditemukan' }, { status: 404 })
    }

    // Tolak jika masih ada anggota aktif
    if (kk.anggota.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus KK yang masih memiliki anggota aktif' },
        { status: 400 }
      )
    }

    // Ambil semua penduduk yang pernah terhubung ke KK ini (termasuk nonaktif)
    const semuaPenduduk = await prisma.penduduk.findMany({
      where: { noKK: kk.noKK },
      select: { id: true },
    })
    const pendudukIds = semuaPenduduk.map((p) => p.id)

    // Jalankan dalam satu transaksi:
    // 1. Nonaktifkan semua bansos yang masih aktif/pending milik anggota KK ini
    // 2. Lepas semua relasi penduduk dari KK (set noKK = null)
    // 3. Hapus KK
    await prisma.$transaction([
      // Nonaktifkan bansos
      prisma.bansos.updateMany({
        where: {
          pendudukId: { in: pendudukIds },
          status: { in: ['AKTIF', 'PENDING'] },
        },
        data: {
          status: 'TIDAK_AKTIF',
          keterangan: `Dinonaktifkan otomatis: KK ${kk.noKK} dihapus`,
          tanggalAkhir: new Date(),
        },
      }),
      // Putus relasi penduduk ke KK
      prisma.penduduk.updateMany({
        where: { noKK: kk.noKK },
        data: { noKK: null as unknown as string },
      }),
      // Hapus KK
      prisma.kartuKeluarga.delete({ where: { id } }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Kartu Keluarga berhasil dihapus dan bansos anggota dinonaktifkan',
    })
  } catch (error) {
    console.error('[KK DELETE ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}