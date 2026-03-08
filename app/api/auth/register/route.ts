// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import type { User } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nik, nama, email, password, noHp } = body

    // --- Validasi dasar ---
    if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
      return NextResponse.json({ error: 'NIK harus 16 digit angka' }, { status: 400 })
    }
    if (!nama?.trim() || nama.trim().length < 2) {
      return NextResponse.json({ error: 'Nama minimal 2 karakter' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // --- Cek duplikasi ---
    const [existingEmail, existingNik] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { nik } }),
    ])

    if (existingEmail) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }
    if (existingNik) {
      return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // --- Cek apakah NIK sudah ada di tabel Penduduk (data diinput admin) ---
    const pendudukExisting = await prisma.penduduk.findUnique({
      where: { nik },
    })

    let user: User

    if (pendudukExisting) {
      // NIK sudah ada di data penduduk → link langsung
      // Cek apakah penduduk sudah punya akun user lain
      if (pendudukExisting.userId) {
        // userId di penduduk sudah terisi → cek apakah user tersebut exist
        const linkedUser = await prisma.user.findUnique({
          where: { id: pendudukExisting.userId },
        })
        if (linkedUser) {
          return NextResponse.json(
            { error: 'NIK ini sudah terhubung ke akun lain' },
            { status: 400 }
          )
        }
      }

      // Buat user dulu, lalu update Penduduk.userId
      user = await prisma.user.create({
        data: {
          nik,
          nama: nama.trim(),
          email,
          password: hashedPassword,
          noHp: noHp || null,
          role: 'WARGA',
          isVerified: true, // Sudah terverifikasi karena NIK ada di DB admin
        },
      })

      // Update penduduk → link ke user baru
      await prisma.penduduk.update({
        where: { nik },
        data: { userId: user.id },
      })
    } else {
      // NIK belum ada di DB penduduk → buat user saja, admin perlu verifikasi
      user = await prisma.user.create({
        data: {
          nik,
          nama: nama.trim(),
          email,
          password: hashedPassword,
          noHp: noHp || null,
          role: 'WARGA',
          isVerified: false, // Belum diverifikasi, tunggu admin
        },
      })

      // Buat notifikasi ke semua admin agar mereka tahu ada pendaftar baru
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN'] } },
        select: { id: true },
      })

      if (admins.length > 0) {
        await prisma.notifikasi.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            judul: 'Pendaftar Baru Perlu Verifikasi',
            pesan: `${nama.trim()} (NIK: ${nik}) mendaftar tetapi NIK-nya belum ada di data penduduk. Mohon verifikasi dan tambahkan data penduduknya.`,
            tipe: 'VERIFIKASI_WARGA',
            refId: user.id,
          })),
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: pendudukExisting
          ? 'Registrasi berhasil! Akun Anda sudah terhubung ke data kependudukan.'
          : 'Registrasi berhasil! Akun Anda sedang menunggu verifikasi dari admin desa.',
        isVerified: pendudukExisting ? true : false,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}