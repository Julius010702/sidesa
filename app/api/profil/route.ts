import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function getUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { penduduk: true },
  })
}

// GET /api/profil — ambil data profil + penduduk
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
      noHp: user.noHp,
      fotoUrl: user.fotoUrl,
      role: user.role,
      createdAt: user.createdAt,
    },
    penduduk: user.penduduk,
  })
}

// PATCH /api/profil — update nama & noHp
export async function PATCH(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { nama, noHp } = body

  if (!nama?.trim()) {
    return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { nama: nama.trim(), noHp: noHp?.trim() || null },
    select: { nama: true, noHp: true },
  })

  return NextResponse.json(updated)
}