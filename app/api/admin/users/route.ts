// app/api/admin/users/route.ts
// GET  → list semua user (dengan filter unverified)
// PATCH → verifikasi user + link ke penduduk

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') // 'unverified' | 'all'
    const q = searchParams.get('q') || ''

    const where: Record<string, unknown> = {}
    if (filter === 'unverified') where.isVerified = false
    if (q) {
      where.OR = [
        { nama: { contains: q, mode: 'insensitive' } },
        { nik: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nik: true,
        nama: true,
        email: true,
        noHp: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        penduduk: {
          select: {
            id: true,
            nama: true,
            nik: true,
            alamat: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: users })
  } catch (err) {
    console.error('[GET /api/admin/users]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, action, pendudukNik } = body
    // action: 'verify' | 'reject' | 'link' | 'toggle_active'

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId dan action diperlukan' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { penduduk: true },
    })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    if (action === 'verify') {
      // Verifikasi user tanpa link ke penduduk
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      })

      // Kirim notifikasi ke user
      await prisma.notifikasi.create({
        data: {
          userId,
          judul: 'Akun Terverifikasi',
          pesan: 'Akun Anda telah diverifikasi oleh admin desa. Anda sekarang dapat menggunakan semua fitur.',
          tipe: 'AKUN',
        },
      })

      return NextResponse.json({ success: true, message: 'User berhasil diverifikasi' })
    }

    if (action === 'link') {
      // Link user ke data penduduk berdasarkan NIK
      if (!pendudukNik) {
        return NextResponse.json({ error: 'NIK penduduk diperlukan' }, { status: 400 })
      }

      const penduduk = await prisma.penduduk.findUnique({
        where: { nik: pendudukNik },
      })

      if (!penduduk) {
        return NextResponse.json(
          { error: `Penduduk dengan NIK ${pendudukNik} tidak ditemukan` },
          { status: 404 }
        )
      }

      // Cek apakah penduduk sudah dilink ke user lain
      if (penduduk.userId && penduduk.userId !== userId) {
        return NextResponse.json(
          { error: 'NIK ini sudah terhubung ke akun lain' },
          { status: 400 }
        )
      }

      // Link penduduk ke user + verifikasi user
      await prisma.$transaction([
        prisma.penduduk.update({
          where: { nik: pendudukNik },
          data: { userId },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { isVerified: true },
        }),
      ])

      // Notifikasi ke user
      await prisma.notifikasi.create({
        data: {
          userId,
          judul: 'Akun Terhubung ke Data Kependudukan',
          pesan: `Akun Anda telah berhasil dihubungkan ke data kependudukan atas nama ${penduduk.nama}. Anda kini dapat mengakses semua layanan desa.`,
          tipe: 'AKUN',
        },
      })

      return NextResponse.json({
        success: true,
        message: `User berhasil dihubungkan ke penduduk ${penduduk.nama}`,
      })
    }

    if (action === 'reject') {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      })

      await prisma.notifikasi.create({
        data: {
          userId,
          judul: 'Registrasi Ditolak',
          pesan: 'Maaf, registrasi Anda ditolak oleh admin desa. Hubungi kantor desa untuk informasi lebih lanjut.',
          tipe: 'AKUN',
        },
      })

      return NextResponse.json({ success: true, message: 'User berhasil ditolak' })
    }

    if (action === 'toggle_active') {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive },
      })
      return NextResponse.json({
        success: true,
        message: `User berhasil ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`,
      })
    }

    return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 })
  } catch (err) {
    console.error('[PATCH /api/admin/users]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}