import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))
    const q = searchParams.get('q') ?? ''
    const isPublished = searchParams.get('published')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (isPublished === 'true') where.isPublished = true
    if (q) where.OR = [{ judul: { contains: q, mode: 'insensitive' } }]

    const [data, total] = await Promise.all([
      prisma.berita.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
        include: { author: { select: { nama: true } } },
      }),
      prisma.berita.count({ where }),
    ])

    return NextResponse.json({ success: true, data, total, totalPages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { judul, konten, kategori, excerpt, tags, isPublished, isPinned } = body

    if (!judul || !konten || !kategori) return NextResponse.json({ error: 'judul, konten, kategori wajib' }, { status: 400 })

    const slug = generateSlug(judul)

    const berita = await prisma.berita.create({
      data: {
        judul,
        konten,
        kategori,
        excerpt: excerpt || null,
        tags: tags ?? [],
        isPublished: isPublished ?? false,
        isPinned: isPinned ?? false,
        publishedAt: isPublished ? new Date() : null,
        authorId: session.userId,
        slug,
      },
    })

    return NextResponse.json({ success: true, data: berita }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}