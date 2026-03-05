// app/api/surat/[id]/route.ts  ← FILE INI YANG PUNYA params { id }
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { updateSuratSchema } from '@/lib/validations'
import { generateNomorSurat } from '@/lib/utils'

// GET /api/surat/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const surat = await prisma.surat.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nama: true, nik: true, noHp: true, email: true } },
      },
    })

    if (!surat) return NextResponse.json({ error: 'Surat tidak ditemukan' }, { status: 404 })

    const adminRoles = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']
    if (!adminRoles.includes(session.role) && surat.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: surat })
  } catch (error) {
    console.error('[SURAT GET BY ID ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PATCH /api/surat/[id] — update status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminRoles = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']
    if (!adminRoles.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = updateSuratSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const existing = await prisma.surat.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Surat tidak ditemukan' }, { status: 404 })

    const { status, catatanAdmin, nomorSurat, suratJadiUrl } = parsed.data

    const updateData: Record<string, unknown> = {
      ...(status && { status }),
      ...(catatanAdmin !== undefined && { catatanAdmin }),
      ...(suratJadiUrl !== undefined && { suratJadiUrl }),
    }

    if (status === 'DISETUJUI' && !existing.nomorSurat) {
      updateData.nomorSurat = nomorSurat ?? generateNomorSurat(existing.jenisSurat)
      updateData.tanggalDiproses = new Date()
      updateData.processedBy = session.userId
    }

    if (status === 'SELESAI') updateData.tanggalSelesai = new Date()

    if (status === 'DIPROSES' && !existing.tanggalDiproses) {
      updateData.tanggalDiproses = new Date()
      updateData.processedBy = session.userId
    }

    const updated = await prisma.surat.update({ where: { id }, data: updateData })

    if (status) {
      const pesanMap: Record<string, string> = {
        DIPROSES: 'Surat Anda sedang diproses oleh perangkat desa.',
        DISETUJUI: `Surat Anda telah disetujui dengan nomor ${updateData.nomorSurat ?? '-'}.`,
        DITOLAK: `Surat Anda ditolak. ${catatanAdmin ? 'Alasan: ' + catatanAdmin : ''}`,
        SELESAI: 'Surat Anda telah selesai dan siap diambil.',
      }

      if (pesanMap[status]) {
        await prisma.notifikasi.create({
          data: {
            userId: existing.userId,
            judul: `Status Surat Diperbarui: ${status}`,
            pesan: pesanMap[status],
            tipe: 'SURAT',
            refId: id,
          },
        })
      }
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[SURAT PATCH ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE /api/surat/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const surat = await prisma.surat.findUnique({ where: { id } })
    if (!surat) return NextResponse.json({ error: 'Surat tidak ditemukan' }, { status: 404 })

    if (surat.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (surat.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Hanya surat berstatus PENDING yang dapat dibatalkan' },
        { status: 400 }
      )
    }

    await prisma.surat.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Surat berhasil dibatalkan' })
  } catch (error) {
    console.error('[SURAT DELETE ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}