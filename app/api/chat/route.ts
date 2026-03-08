import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('userId')
    const isAdmin = ADMIN_ROLES.includes(session.role)

    if (isAdmin && targetUserId) {
      const messages = await prisma.chatMessage.findMany({
        where: { userId: targetUserId, deletedByAdmin: false },
        orderBy: { createdAt: 'asc' },
        take: 100,
      })
      await prisma.chatMessage.updateMany({
        where: { userId: targetUserId, isFromAdmin: false, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true, data: messages })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.userId, deletedByUser: false },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })
    return NextResponse.json({ success: true, data: messages })
  } catch (err) {
    console.error('[GET /api/chat]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { pesan, tipe = 'text', mediaUrl, targetUserId } = body

    if (!pesan?.trim() && !mediaUrl)
      return NextResponse.json({ error: 'Pesan atau media wajib diisi' }, { status: 400 })

    if (!['text', 'image', 'voice'].includes(tipe))
      return NextResponse.json({ error: 'Tipe pesan tidak valid' }, { status: 400 })

    const isAdmin = ADMIN_ROLES.includes(session.role)

    const message = await prisma.chatMessage.create({
      data: {
        userId: isAdmin && targetUserId ? targetUserId : session.userId,
        pesan: pesan?.trim() || '',
        tipe,
        mediaUrl: mediaUrl || null,
        isFromAdmin: isAdmin,
      },
    })
    return NextResponse.json({ success: true, data: message }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const messageId = searchParams.get('id')
    if (!messageId) return NextResponse.json({ error: 'id pesan wajib diisi' }, { status: 400 })

    const message = await prisma.chatMessage.findUnique({ where: { id: messageId } })
    if (!message) return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 })

    const isAdmin = ADMIN_ROLES.includes(session.role)
    const isOwner = message.userId === session.userId

    if (isAdmin) {
      // Admin hapus → hilang dari sisi admin saja, warga masih lihat
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { deletedByAdmin: true },
      })
      return NextResponse.json({ success: true })
    }

    if (!isOwner)
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })

    if (message.isFromAdmin) {
      // Warga hapus pesan dari admin → hilang di warga saja, admin masih lihat
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { deletedByUser: true },
      })
    } else {
      // Warga hapus pesannya sendiri → hilang dari kedua sisi
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { deletedByUser: true, deletedByAdmin: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/chat]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}