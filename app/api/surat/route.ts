import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ajukanSuratSchema } from '@/lib/validations'

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const isAdmin = ADMIN_ROLES.includes(session.role)

    const where = {
      ...(isAdmin ? {} : { userId: session.userId }),
      ...(status ? { status: status as never } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.surat.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, nama: true, nik: true, noHp: true, email: true } },
        },
      }),
      prisma.surat.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[SURAT GET ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = ajukanSuratSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { jenisSurat, keperluan } = parsed.data

    // Ambil data warga untuk nama di notifikasi admin
    const warga = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { nama: true, nik: true },
    })

    const surat = await prisma.surat.create({
      data: {
        userId: session.userId,
        jenisSurat,
        keperluan,
        status: 'PENDING',
        tanggalDiajukan: new Date(),
      },
    })

    const jenisSuratLabel = jenisSurat.replace(/_/g, ' ')

    // ✅ Notifikasi ke warga sendiri
    await prisma.notifikasi.create({
      data: {
        userId: session.userId,
        judul: 'Pengajuan Surat Diterima',
        pesan: `Pengajuan surat ${jenisSuratLabel} Anda telah diterima dan sedang menunggu diproses oleh perangkat desa.`,
        tipe: 'SURAT',
        refId: surat.id,
      },
    })

    // ✅ Notifikasi ke semua admin/perangkat desa
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ADMIN_ROLES as never[] },
        isActive: true,
      },
      select: { id: true },
    })

    if (adminUsers.length > 0) {
      await prisma.notifikasi.createMany({
        data: adminUsers.map((admin) => ({
          userId: admin.id,
          judul: 'Surat Masuk Baru',
          pesan: `${warga?.nama ?? 'Warga'} (NIK: ${warga?.nik ?? '-'}) mengajukan Surat ${jenisSuratLabel}. Segera diproses.`,
          tipe: 'SURAT',
          refId: surat.id,
        })),
      })
    }

    return NextResponse.json(
      { success: true, message: 'Surat berhasil diajukan', data: surat },
      { status: 201 }
    )
  } catch (error) {
    console.error('[SURAT POST ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}