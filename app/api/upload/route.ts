import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { getSession } from '@/lib/auth'

const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_AUDIO = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024 // 10MB

// Folder yang diizinkan agar tidak bisa dimanipulasi
const ALLOWED_FOLDERS = ['chat', 'berita', 'infrastruktur', 'pengaduan', 'profil', 'surat']

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })

    const isImage = ALLOWED_IMAGE.includes(file.type)
    const isAudio = ALLOWED_AUDIO.includes(file.type)

    if (!isImage && !isAudio) {
      return NextResponse.json({ error: 'Tipe file tidak didukung' }, { status: 400 })
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `Ukuran file terlalu besar (maks ${isImage ? '5MB' : '10MB'})`
      }, { status: 400 })
    }

    // Ambil folder dari formData, default ke 'chat'
    const folderParam = (formData.get('folder') as string | null) ?? 'chat'
    const folder = ALLOWED_FOLDERS.includes(folderParam) ? folderParam : 'chat'

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subfolder berdasarkan tipe file
    const typeFolder = isImage ? 'images' : 'voices'

    // Subfolder bulan: 2025-01
    const now = new Date()
    const subdir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Path: public/uploads/{folder}/{typeFolder}/{subdir}/
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder, typeFolder, subdir)
    await mkdir(uploadDir, { recursive: true })

    // Nama file unik
    const ext = isImage ? (extname(file.name) || '.jpg') : '.webm'
    const filename = `${session.userId}-${Date.now()}${ext}`
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/${folder}/${typeFolder}/${subdir}/${filename}`
    return NextResponse.json({ success: true, url })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Gagal upload file' }, { status: 500 })
  }
}