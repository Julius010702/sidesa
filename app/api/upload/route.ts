import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { getSession } from '@/lib/auth'

const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
// Base MIME types tanpa codec suffix
const ALLOWED_AUDIO_BASE = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_FOLDERS = ['chat', 'berita', 'infrastruktur', 'pengaduan', 'profil', 'surat']

// Ambil base MIME type, buang codec suffix (misal: "audio/webm;codecs=opus" → "audio/webm")
function getBaseMime(mimeType: string): string {
  return mimeType.split(';')[0].trim().toLowerCase()
}

// Tentukan extension dari MIME type audio
function getAudioExt(baseMime: string): string {
  const map: Record<string, string> = {
    'audio/webm': '.webm',
    'audio/ogg': '.ogg',
    'audio/mp4': '.mp4',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
  }
  return map[baseMime] ?? '.webm'
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })

    const baseMime = getBaseMime(file.type)

    const isImage = ALLOWED_IMAGE.includes(baseMime)
    const isAudio = ALLOWED_AUDIO_BASE.includes(baseMime)

    if (!isImage && !isAudio) {
      console.warn(`[upload] MIME type tidak didukung: "${file.type}" (base: "${baseMime}")`)
      return NextResponse.json({
        error: `Tipe file tidak didukung: ${file.type}`
      }, { status: 400 })
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

    const typeFolder = isImage ? 'images' : 'voices'

    const now = new Date()
    const subdir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const uploadDir = join(process.cwd(), 'public', 'uploads', folder, typeFolder, subdir)
    await mkdir(uploadDir, { recursive: true })

    // Untuk gambar: pakai ext dari nama file asli, fallback ke .jpg
    // Untuk audio: tentukan dari MIME type agar akurat
    const ext = isImage
      ? (extname(file.name) || '.jpg')
      : getAudioExt(baseMime)

    const filename = `${session.userId}-${Date.now()}${ext}`
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/${folder}/${typeFolder}/${subdir}/${filename}`
    return NextResponse.json({ success: true, url })
  } catch (e) {
    console.error('[upload] error:', e)
    return NextResponse.json({ error: 'Gagal upload file' }, { status: 500 })
  }
}