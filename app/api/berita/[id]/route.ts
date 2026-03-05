import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const berita = await prisma.berita.findUnique({ where: { id }, include: { author: { select: { nama: true } } } })
    if (!berita) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ success: true, data: berita })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const updated = await prisma.berita.update({
      where: { id },
      data: {
        judul: body.judul,
        konten: body.konten,
        kategori: body.kategori,
        excerpt: body.excerpt ?? null,
        tags: body.tags ?? [],
        isPublished: body.isPublished,
        isPinned: body.isPinned,
        publishedAt: body.isPublished ? new Date() : null,
      },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    await prisma.berita.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
