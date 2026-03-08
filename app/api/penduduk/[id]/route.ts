// app/api/penduduk/[id]/route.ts
// GET    → detail penduduk by id
// PUT    → edit penduduk
// DELETE → nonaktifkan penduduk + hapus akun user terhubung

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

    const penduduk = await prisma.penduduk.findUnique({
      where: { id },
      include: {
        kartuKeluarga: {
          include: {
            anggota: {
              where: { statusHidup: true },
              select: {
                id: true,
                nama: true,
                nik: true,
                tanggalLahir: true,
                jenisKelamin: true,
                statusKawin: true,
              },
            },
          },
        },
        bansos: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    if (!penduduk) return NextResponse.json({ error: 'Penduduk tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ success: true, data: penduduk })
  } catch (err) {
    console.error('[GET /api/penduduk/[id]]', err)
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

    const existing = await prisma.penduduk.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Penduduk tidak ditemukan' }, { status: 404 })

    const {
      nama, tempatLahir, tanggalLahir, agama, pendidikan, pekerjaan,
      statusPerkawinan, alamat, rt, rw, dusun, kelurahan,
      kecamatan, kabupaten, provinsi, kodePos,
    } = body

    const agamaMap: Record<string, string> = {
      Islam: 'ISLAM', Kristen: 'KRISTEN', Katolik: 'KATOLIK',
      Hindu: 'HINDU', Buddha: 'BUDDHA', Konghucu: 'KONGHUCU',
    }

    const penduduk = await prisma.penduduk.update({
      where: { id },
      data: {
        ...(nama && { nama: nama.trim() }),
        ...(tempatLahir && { tempatLahir: tempatLahir.trim() }),
        ...(tanggalLahir && { tanggalLahir: new Date(tanggalLahir) }),
        ...(agama && { agama: (agamaMap[agama] || agama.toUpperCase()) as never }),
        ...(pendidikan !== undefined && { pendidikan: pendidikan || null }),
        ...(pekerjaan !== undefined && { pekerjaan: pekerjaan || null }),
        ...(statusPerkawinan && { statusKawin: statusPerkawinan as never }),
        ...(alamat && { alamat: alamat.trim() }),
        ...(rt !== undefined && { rt }),
        ...(rw !== undefined && { rw }),
        ...(dusun !== undefined && { dusun }),
        ...(kelurahan && { kelurahan }),
        ...(kecamatan && { kecamatan }),
        ...(kabupaten && { kabupaten }),
        ...(provinsi && { provinsi }),
        ...(kodePos !== undefined && { kodePos }),
      },
    })

    return NextResponse.json({ success: true, data: penduduk })
  } catch (err) {
    console.error('[PUT /api/penduduk/[id]]', err)
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

    // Ambil data penduduk beserta akun user yang terhubung
    const existing = await prisma.penduduk.findUnique({
      where: { id },
      include: { user: { select: { id: true, role: true, nama: true } } },
    })
    if (!existing) return NextResponse.json({ error: 'Penduduk tidak ditemukan' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      // 1. Soft delete penduduk — data tetap ada tapi tidak aktif
      await tx.penduduk.update({
        where: { id },
        data: { statusHidup: false },
      })

      // 2. Hapus akun user yang terhubung (jika ada dan bukan akun admin)
      if (existing.user && !ADMIN_ROLES.includes(existing.user.role)) {
        // Hapus notifikasi user dulu (foreign key constraint)
        await tx.notifikasi.deleteMany({ where: { userId: existing.user.id } })
        // Hapus akun user
        await tx.user.delete({ where: { id: existing.user.id } })
      }
    })

    return NextResponse.json({
      success: true,
      message: existing.user
        ? `Data penduduk dinonaktifkan dan akun "${existing.user.nama}" berhasil dihapus`
        : 'Data penduduk berhasil dinonaktifkan',
      userDeleted: !!existing.user,
    })
  } catch (err) {
    console.error('[DELETE /api/penduduk/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}