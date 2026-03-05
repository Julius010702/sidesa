import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { updatePengaduanSchema } from '@/lib/validations'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

// GET /api/pengaduan/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const pengaduan = await prisma.pengaduan.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nama: true, nik: true, noHp: true } },
      },
    })

    if (!pengaduan) {
      return NextResponse.json({ error: 'Pengaduan tidak ditemukan' }, { status: 404 })
    }

    const isAdmin = ADMIN_ROLES.includes(session.role)
    if (!isAdmin && pengaduan.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: pengaduan })
  } catch (error) {
    console.error('[PENGADUAN GET BY ID ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PATCH /api/pengaduan/[id] — update status oleh admin
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = updatePengaduanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const existing = await prisma.pengaduan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Pengaduan tidak ditemukan' }, { status: 404 })
    }

    const { status, prioritas, catatanAdmin, assignedTo, buktiSelesai } = parsed.data

    const updateData: Record<string, unknown> = {
      ...(status && { status }),
      ...(prioritas !== undefined && { prioritas }),
      ...(catatanAdmin !== undefined && { catatanAdmin }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(buktiSelesai !== undefined && { buktiSelesai }),
    }

    if (status === 'SELESAI') {
      updateData.tanggalSelesai = new Date()
    }

    const updated = await prisma.pengaduan.update({
      where: { id },
      data: updateData,
    })

    // Kirim notifikasi ke pelapor
    if (status) {
      const pesanMap: Record<string, string> = {
        DICEK: 'Pengaduan Anda sedang dicek oleh perangkat desa.',
        DIPROSES: 'Pengaduan Anda sedang dalam proses penanganan.',
        SELESAI: 'Pengaduan Anda telah selesai ditangani. Terima kasih atas laporannya!',
        DITOLAK: `Pengaduan Anda tidak dapat diproses. ${catatanAdmin ? 'Alasan: ' + catatanAdmin : ''}`,
      }

      if (pesanMap[status]) {
        await prisma.notifikasi.create({
          data: {
            userId: existing.userId,
            judul: `Pengaduan Diperbarui: ${status}`,
            pesan: pesanMap[status],
            tipe: 'PENGADUAN',
            refId: id,
          },
        })
      }
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[PENGADUAN PATCH ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}