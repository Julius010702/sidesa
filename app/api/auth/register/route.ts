import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validasi input
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { nik, nama, email, password, noHp } = parsed.data

    // Cek email duplikat
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Gunakan email lain atau masuk ke akun Anda.' },
        { status: 409 }
      )
    }

    // Cek NIK duplikat
    const existingNik = await prisma.user.findUnique({ where: { nik } })
    if (existingNik) {
      return NextResponse.json(
        { error: 'NIK sudah terdaftar. Hubungi admin desa jika ada masalah.' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        nik,
        nama,
        email,
        password: hashedPassword,
        noHp: noHp || null,
        role: 'WARGA',
        isVerified: false,
        isActive: true,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Akun berhasil dibuat. Silakan masuk.',
        data: user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}