import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const limit = parseInt(new URL(req.url).searchParams.get('limit') ?? '20')
    const notifikasi = await prisma.notifikasi.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 50),
    })
    const unreadCount = await prisma.notifikasi.count({ where: { userId: session.userId, status: 'BELUM_DIBACA' } })
    return NextResponse.json({ success: true, data: notifikasi, unreadCount })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { action } = await req.json()
    if (action === 'read_all') {
      await prisma.notifikasi.updateMany({ where: { userId: session.userId, status: 'BELUM_DIBACA' }, data: { status: 'SUDAH_DIBACA' } })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}