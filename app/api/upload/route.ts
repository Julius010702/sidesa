import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_AUDIO_BASE = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_AUDIO_SIZE = 10 * 1024 * 1024

const ALLOWED_FOLDERS = ['chat', 'berita', 'infrastruktur', 'pengaduan', 'profil', 'surat']

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log('[cloudinary config]', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? 'MISSING',
  api_key:    process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
})

function getBaseMime(mimeType: string): string {
  return mimeType.split(';')[0].trim().toLowerCase()
}

function getAudioExt(baseMime: string): string {
  const map: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/ogg':  'ogg',
    'audio/mp4':  'mp4',
    'audio/mpeg': 'mp3',
    'audio/wav':  'wav',
  }
  return map[baseMime] ?? 'webm'
}

function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string
    publicId: string
    resourceType: 'image' | 'video' | 'raw' | 'auto'
    format?: string
  }
): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:        options.folder,
        public_id:     options.publicId,
        resource_type: options.resourceType,
        format:        options.format,
      },
      (error, result) => {
        if (error || !result) {
          console.error('[cloudinary] upload error:', error)
          return reject(error ?? new Error('Upload gagal'))
        }
        console.log('[cloudinary] upload success:', result.secure_url)
        resolve(result)
      }
    )
    uploadStream.end(buffer)
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })

    console.log('[upload] file:', { name: file.name, type: file.type, size: file.size })

    const baseMime = getBaseMime(file.type)
    const isImage  = ALLOWED_IMAGE.includes(baseMime)
    const isAudio  = ALLOWED_AUDIO_BASE.includes(baseMime)

    if (!isImage && !isAudio) {
      console.warn(`[upload] MIME type tidak didukung: "${file.type}" (base: "${baseMime}")`)
      return NextResponse.json({ error: `Tipe file tidak didukung: ${file.type}` }, { status: 400 })
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `Ukuran file terlalu besar (maks ${isImage ? '5MB' : '10MB'})`
      }, { status: 400 })
    }

    const folderParam = (formData.get('folder') as string | null) ?? 'chat'
    const folder      = ALLOWED_FOLDERS.includes(folderParam) ? folderParam : 'chat'

    console.log('[upload] folder:', folder)

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const now        = new Date()
    const subdir     = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const typeFolder = isImage ? 'images' : 'voices'
    const cloudFolder = `sidesa/${folder}/${typeFolder}/${subdir}`
    const publicId    = `${session.userId}-${Date.now()}`
    const resourceType = isImage ? 'image' : 'video'
    const format       = isImage ? undefined : getAudioExt(baseMime)

    console.log('[upload] uploading to cloudinary...', { cloudFolder, publicId, resourceType })

    const result = await uploadToCloudinary(buffer, {
      folder:       cloudFolder,
      publicId,
      resourceType,
      format,
    })

    console.log('[upload] done:', result.secure_url)

    return NextResponse.json({ success: true, url: result.secure_url })
  } catch (e) {
    console.error('[upload] error:', e)
    return NextResponse.json({ error: 'Gagal upload file' }, { status: 500 })
  }
}