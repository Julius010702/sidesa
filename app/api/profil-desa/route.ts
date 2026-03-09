import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES']

export async function GET() {
  try {
    const profil = await prisma.profilDesa.findFirst()
    return NextResponse.json({ success: true, data: profil })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const {
      namaDesaa, kepalaDesaa, alamat, telepon, email, website,
      deskripsi, visi, misi, luasWilayah, jumlahDusun,
      logoUrl, bannerUrl   // ← tambah
    } = body

    if (!namaDesaa || !kepalaDesaa || !alamat)
      return NextResponse.json({ error: 'Nama desa, kepala desa, dan alamat wajib diisi' }, { status: 400 })

    const existing = await prisma.profilDesa.findFirst()

    const data = {
      namaDesaa, kepalaDesaa, alamat,
      telepon:     telepon     || null,
      email:       email       || null,
      website:     website     || null,
      deskripsi:   deskripsi   || null,
      visi:        visi        || null,
      misi:        misi        || null,
      luasWilayah: luasWilayah ?? null,
      jumlahDusun: jumlahDusun ?? null,
      logoUrl:     logoUrl     ?? null,   // ← tambah
      bannerUrl:   bannerUrl   ?? null,   // ← tambah
    }

    const profil = existing
      ? await prisma.profilDesa.update({ where: { id: existing.id }, data })
      : await prisma.profilDesa.create({ data })

    return NextResponse.json({ success: true, data: profil })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}