import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES']

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const formData = await req.formData()
    const file = formData.get('gambar') as File | null
    const tipe = formData.get('tipe') as string | null // 'logo' | 'banner'

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ error: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP' }, { status: 400 })

    const maxSize = tipe === 'banner' ? 8 * 1024 * 1024 : 2 * 1024 * 1024
    if (file.size > maxSize)
      return NextResponse.json({ error: `Ukuran maks: ${tipe === 'banner' ? '8MB' : '2MB'}` }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'desa')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg'
    const filename = `${tipe ?? 'foto'}-desa-${Date.now()}.${ext}`
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ success: true, url: `/uploads/desa/${filename}` })
  } catch {
    return NextResponse.json({ error: 'Gagal mengupload gambar' }, { status: 500 })
  }
}