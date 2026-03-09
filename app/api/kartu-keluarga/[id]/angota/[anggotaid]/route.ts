// app/api/kartu-keluarga/[id]/anggota/[anggotaId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

// DELETE /api/kartu-keluarga/[id]/anggota/[anggotaId]
// Melepas anggota dari KK + nonaktifkan bansos anggota tersebut
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; anggotaId: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, anggotaId } = await params

    const kk = await prisma.kartuKeluarga.findUnique({ where: { id } })
    if (!kk) {
      return NextResponse.json({ error: 'Kartu Keluarga tidak ditemukan' }, { status: 404 })
    }

    const anggota = await prisma.penduduk.findUnique({ where: { id: anggotaId } })
    if (!anggota) {
      return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })
    }
    if (anggota.noKK !== kk.noKK) {
      return NextResponse.json({ error: 'Anggota bukan bagian dari KK ini' }, { status: 400 })
    }

    // Jalankan dalam satu transaksi:
    // 1. Lepas anggota dari KK (set noKK = null)
    // 2. Nonaktifkan semua bansos aktif milik anggota ini
    await prisma.$transaction([
      prisma.penduduk.update({
        where: { id: anggotaId },
        data: { noKK: null as unknown as string },
      }),
      prisma.bansos.updateMany({
        where: {
          pendudukId: anggotaId,
          status: { in: ['AKTIF', 'PENDING'] },
        },
        data: {
          status: 'TIDAK_AKTIF',
          keterangan: `Dinonaktifkan otomatis: anggota dilepas dari KK ${kk.noKK}`,
          tanggalAkhir: new Date(),
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: `${anggota.nama} berhasil dilepas dari KK dan bansos dinonaktifkan`,
    })
  } catch (error) {
    console.error('[ANGGOTA KK DELETE ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}