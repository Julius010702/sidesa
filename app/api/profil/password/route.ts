import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { passwordLama, passwordBaru } = await request.json()

  if (!passwordLama || !passwordBaru) {
    return NextResponse.json({ error: 'Password lama dan baru wajib diisi' }, { status: 400 })
  }

  if (passwordBaru.length < 6) {
    return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

  const isValid = await bcrypt.compare(passwordLama, user.password)
  if (!isValid) {
    return NextResponse.json({ message: 'Password lama tidak sesuai' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(passwordBaru, 10)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

  return NextResponse.json({ message: 'Password berhasil diubah' })
}