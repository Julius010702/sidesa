// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import type { User } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nik, nama, email, password, noHp } = body

    // Validasi dasar
    if (!nik || nik.length !== 16 || !/^\d+$/.test(nik))
      return NextResponse.json({ error: 'NIK harus 16 digit angka' }, { status: 400 })
    if (!nama?.trim() || nama.trim().length < 2)
      return NextResponse.json({ error: 'Nama minimal 2 karakter' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    if (!password || password.length < 6)
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })

    // Cek duplikasi email & NIK di User
    const [existingEmail, existingNik] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { nik } }),
    ])
    if (existingEmail) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    if (existingNik)   return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 12)

    // Cek apakah NIK sudah ada di tabel Penduduk (data diinput admin duluan)
    const pendudukExisting = await prisma.penduduk.findUnique({ where: { nik } })

    let user: User
    let isVerified = false
    let autoLinked = false

    if (pendudukExisting) {
      // ── Skenario A: Admin sudah input data penduduk → link langsung ──
      if (pendudukExisting.userId) {
        const linked = await prisma.user.findUnique({ where: { id: pendudukExisting.userId } })
        if (linked) return NextResponse.json({ error: 'NIK ini sudah terhubung ke akun lain' }, { status: 400 })
      }

      user = await prisma.user.create({
        data: { nik, nama: nama.trim(), email, password: hashedPassword, noHp: noHp || null, role: 'WARGA', isVerified: true },
      })

      await prisma.penduduk.update({
        where: { nik },
        data: { userId: user.id },
      })

      isVerified = true
      autoLinked = true

    } else {
      // ── Skenario B: NIK belum ada → buat User + buat Penduduk minimal ──
      // Ambil noKK dari NIK (digit 1-6 adalah kode wilayah, kita pakai NIK sebagai noKK sementara)
      // noKK akan diisi admin nanti; pakai NIK sebagai placeholder agar constraint terpenuhi
      const placeholderNoKK = nik // admin dapat update ini nanti

      // Buat KartuKeluarga placeholder jika belum ada
      const kkExist = await prisma.kartuKeluarga.findUnique({ where: { noKK: placeholderNoKK } })
      if (!kkExist) {
        await prisma.kartuKeluarga.create({
          data: {
            noKK: placeholderNoKK,
            namaKepala: nama.trim(),
            alamat: '-',
            rt: '-', rw: '-',
            kelurahan: '-', kecamatan: '-',
            kabupaten: '-', provinsi: '-',
          },
        })
      }

      // Buat User + Penduduk dalam satu transaksi
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            nik, nama: nama.trim(), email,
            password: hashedPassword,
            noHp: noHp || null,
            role: 'WARGA',
            isVerified: false, // perlu dilengkapi admin
          },
        })

        // Buat Penduduk minimal — field required diisi placeholder
        await tx.penduduk.create({
          data: {
            userId: newUser.id,
            nik,
            noKK: placeholderNoKK,
            nama: nama.trim(),
            tempatLahir: '-',           // placeholder, admin lengkapi
            tanggalLahir: new Date('2000-01-01'), // placeholder
            jenisKelamin: 'LAKI_LAKI',  // placeholder, admin edit
            agama: 'ISLAM',             // placeholder, admin edit
            statusKawin: 'BELUM_KAWIN', // placeholder, admin edit
            alamat: '-',
            rt: '-', rw: '-',
            kelurahan: '-', kecamatan: '-',
            kabupaten: '-', provinsi: '-',
            keterangan: 'Data belum lengkap — perlu dilengkapi admin',
          },
        })

        return newUser
      })

      // Notifikasi ke admin
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN'] } },
        select: { id: true },
      })
      if (admins.length > 0) {
        await prisma.notifikasi.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            judul: 'Warga Baru Mendaftar — Perlu Dilengkapi',
            pesan: `${nama.trim()} (NIK: ${nik}) telah mendaftar. Data penduduknya sudah dibuat otomatis dengan data minimal. Mohon lengkapi data kependudukannya.`,
            tipe: 'VERIFIKASI_WARGA',
            refId: user.id,
          })),
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        isVerified,
        autoLinked,
        message: isVerified
          ? 'Registrasi berhasil! Akun Anda sudah terhubung ke data kependudukan.'
          : 'Registrasi berhasil! Data Anda sudah tercatat. Admin akan melengkapi data kependudukan Anda.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}