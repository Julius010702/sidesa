import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken, type Role } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Akun Anda telah dinonaktifkan. Hubungi admin desa.' },
        { status: 403 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      nama: user.nama,
    })

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + COOKIE_MAX_AGE * 1000),
      },
    })

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('[LOGIN ERROR]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}