import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

function buildNotifWarga(
  jenisSurat: string,
  status: string,
  fileUrl?: string | null,
  catatanAdmin?: string | null
): { judul: string; pesan: string } {
  const label = jenisSurat.replace(/_/g, ' ')

  switch (status) {
    case 'DIPROSES':
      return {
        judul: '📋 Surat Sedang Diproses',
        pesan: `Surat ${label} Anda sedang diproses oleh perangkat desa. Mohon tunggu.`,
      }
    case 'DISETUJUI':
      return {
        judul: '✅ Surat Disetujui',
        pesan: `Surat ${label} Anda telah disetujui dan sedang disiapkan.${catatanAdmin ? ` Catatan: ${catatanAdmin}` : ''}`,
      }
    case 'SELESAI':
      if (fileUrl) {
        return {
          judul: '🎉 Surat Siap Diunduh',
          pesan: `Surat ${label} Anda sudah selesai dan dapat diunduh. Klik untuk melihat detail dan mengunduh surat Anda.`,
        }
      }
      return {
        judul: '🎉 Surat Sudah Selesai',
        pesan: `Surat ${label} Anda sudah selesai. Silakan ambil langsung di kantor desa.${catatanAdmin ? ` Info: ${catatanAdmin}` : ''}`,
      }
    case 'DITOLAK':
      return {
        judul: '❌ Surat Ditolak',
        pesan: `Surat ${label} Anda tidak dapat diproses.${catatanAdmin ? ` Alasan: ${catatanAdmin}` : ' Silakan hubungi perangkat desa untuk informasi lebih lanjut.'}`,
      }
    default:
      return {
        judul: `Update Surat ${label}`,
        pesan: `Status surat ${label} Anda telah diperbarui menjadi ${status}.`,
      }
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const isAdmin = ADMIN_ROLES.includes(session.role)

    const surat = await prisma.surat.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nama: true, nik: true, noHp: true, email: true } },
      },
    })

    if (!surat) return NextResponse.json({ error: 'Surat tidak ditemukan' }, { status: 404 })
    if (!isAdmin && surat.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: surat })
  } catch (error) {
    console.error('[SURAT GET DETAIL ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, nomorSurat, catatanAdmin, fileUrl } = body

    const existing = await prisma.surat.findUnique({
      where: { id },
      select: { userId: true, jenisSurat: true, status: true },
    })
    if (!existing) return NextResponse.json({ error: 'Surat tidak ditemukan' }, { status: 404 })

    const updated = await prisma.surat.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(nomorSurat ? { nomorSurat } : {}),
        ...(catatanAdmin !== undefined ? { catatanAdmin } : {}),
        ...(fileUrl !== undefined ? { fileUrl } : {}),
        ...(status === 'SELESAI' ? { tanggalSelesai: new Date() } : {}),
      },
    })

    if (status && status !== existing.status) {
      const { judul, pesan } = buildNotifWarga(existing.jenisSurat, status, fileUrl, catatanAdmin)
      await prisma.notifikasi.create({
        data: {
          userId: existing.userId,
          judul,
          pesan,
          tipe: 'SURAT',
          refId: id,
        },
      })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[SURAT PATCH ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}