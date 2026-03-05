import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const chatUsers = await prisma.chatMessage.groupBy({
      by: ['userId'],
      _max: { createdAt: true },
    })

    const result = await Promise.all(
      chatUsers.map(async (cu) => {
        const user = await prisma.user.findUnique({
          where: { id: cu.userId },
          select: { nama: true },
        })

        const lastMsg = await prisma.chatMessage.findFirst({
          where: { userId: cu.userId },
          orderBy: { createdAt: 'desc' },
          select: { pesan: true, tipe: true, createdAt: true },
        })

        const unread = await prisma.chatMessage.count({
          where: { userId: cu.userId, isFromAdmin: false, isRead: false },
        })

        let lastMessage = lastMsg?.pesan || ''
        if (!lastMessage && lastMsg?.tipe === 'image') lastMessage = '📷 Gambar'
        if (!lastMessage && lastMsg?.tipe === 'voice') lastMessage = '🎵 Voice note'

        return {
          userId: cu.userId,
          nama: user?.nama ?? 'Warga',
          lastMessage,
          lastTime: lastMsg?.createdAt ?? '',
          unread,
        }
      })
    )

    result.sort(
      (a, b) =>
        new Date(b.lastTime as string).getTime() -
        new Date(a.lastTime as string).getTime()
    )

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('[GET /api/chat/users]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}