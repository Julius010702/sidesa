// app/api/profil/foto/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('foto') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP' },
        { status: 400 }
      )
    }

    // Validasi ukuran (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 2MB' },
        { status: 400 }
      )
    }

    // Upload ke Vercel Blob
    const ext = file.type.split('/')[1]
    const filename = `foto-profil/${session.userId}-${Date.now()}.${ext}`

    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    })

    // Update fotoUrl di database
    await prisma.user.update({
      where: { id: session.userId },
      data: { fotoUrl: blob.url },
    })

    return NextResponse.json({ success: true, fotoUrl: blob.url })
  } catch (err) {
    console.error('[POST /api/profil/foto]', err)
    return NextResponse.json({ error: 'Gagal mengupload foto' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.user.update({
      where: { id: session.userId },
      data: { fotoUrl: null },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/profil/foto]', err)
    return NextResponse.json({ error: 'Gagal menghapus foto' }, { status: 500 })
  }
}