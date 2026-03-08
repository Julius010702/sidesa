import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const notif = await prisma.notifikasi.findUnique({ where: { id } })
    if (!notif || notif.userId !== session.userId) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    }

    const updated = await prisma.notifikasi.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await prisma.notifikasi.delete({ where: { id, userId: session.userId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}