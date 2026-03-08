import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/notifikasi - Ambil daftar notifikasi milik user yang login
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
    const skip = (page - 1) * limit

    const [data, total, unreadCount] = await Promise.all([
      prisma.notifikasi.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notifikasi.count({ where: { userId: session.userId } }),
      prisma.notifikasi.count({ where: { userId: session.userId, isRead: false } }),
    ])

    return NextResponse.json({
      success: true,
      data,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[NOTIFIKASI GET ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PATCH /api/notifikasi - Tandai semua notifikasi sebagai sudah dibaca
export async function PATCH() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.notifikasi.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca' })
  } catch (error) {
    console.error('[NOTIFIKASI PATCH ALL ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}