import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ===================== USERS =====================

  const hashedAdmin = await bcrypt.hash('admin123', 10)
  const hashedWarga = await bcrypt.hash('warga123', 10)

  // Admin Desa
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@desa.id' },
    update: {},
    create: {
      nik: '3201000000000001',
      nama: 'Admin Desa',
      email: 'admin@desa.id',
      password: hashedAdmin,
      role: 'ADMIN_DESA',
      isVerified: true,
      isActive: true,
    },
  })

  // Sekdes
const _sekdesUser = await prisma.user.upsert({
    where: { email: 'sekdes@desa.id' },
    update: {},
    create: {
      nik: '3201000000000002',
      nama: 'Sekretaris Desa',
      email: 'sekdes@desa.id',
      password: hashedAdmin,
      role: 'SEKDES',
      isVerified: true,
      isActive: true,
    },
  })

  // Warga 1
  const wargaUser1 = await prisma.user.upsert({
    where: { email: 'warga@desa.id' },
    update: {},
    create: {
      nik: '3201000000000003',
      nama: 'Budi Santoso',
      email: 'warga@desa.id',
      password: hashedWarga,
      role: 'WARGA',
      isVerified: true,
      isActive: true,
      noHp: '081234567890',
    },
  })

  // Warga 2
  const wargaUser2 = await prisma.user.upsert({
    where: { email: 'siti@desa.id' },
    update: {},
    create: {
      nik: '3201000000000004',
      nama: 'Siti Rahayu',
      email: 'siti@desa.id',
      password: hashedWarga,
      role: 'WARGA',
      isVerified: true,
      isActive: true,
      noHp: '081234567891',
    },
  })

  console.log('✅ Users created')

  // ===================== PROFIL DESA =====================

  await prisma.profilDesa.upsert({
    where: { id: 'profil-desa-1' },
    update: {},
    create: {
      id: 'profil-desa-1',
      namaDesaa: 'Desa Sukamaju',
      kepalaDesaa: 'H. Ahmad Fauzi, S.IP',
      alamat: 'Jl. Raya Sukamaju No. 1, RT 01/RW 01',
      telepon: '02112345678',
      email: 'desasukamaju@gmail.com',
      website: 'https://desasukamaju.id',
      deskripsi: 'Desa Sukamaju adalah desa yang terletak di Kecamatan Sukamaju, Kabupaten Bogor, Jawa Barat.',
      visi: 'Terwujudnya Desa Sukamaju yang maju, mandiri, dan sejahtera.',
      misi: '1. Meningkatkan pelayanan publik\n2. Mengembangkan potensi ekonomi desa\n3. Meningkatkan kualitas SDM',
      luasWilayah: 250.5,
      jumlahDusun: 4,
    },
  })

  console.log('✅ Profil desa created')

  // ===================== KARTU KELUARGA =====================

  const kk1 = await prisma.kartuKeluarga.upsert({
    where: { noKK: '3201000000000001' },
    update: {},
    create: {
      noKK: '3201000000000001',
      namaKepala: 'Budi Santoso',
      alamat: 'Jl. Mawar No. 5',
      rt: '001',
      rw: '002',
      kelurahan: 'Sukamaju',
      kecamatan: 'Sukamaju',
      kabupaten: 'Bogor',
      provinsi: 'Jawa Barat',
    },
  })

  const kk2 = await prisma.kartuKeluarga.upsert({
    where: { noKK: '3201000000000002' },
    update: {},
    create: {
      noKK: '3201000000000002',
      namaKepala: 'Siti Rahayu',
      alamat: 'Jl. Melati No. 3',
      rt: '002',
      rw: '001',
      kelurahan: 'Sukamaju',
      kecamatan: 'Sukamaju',
      kabupaten: 'Bogor',
      provinsi: 'Jawa Barat',
    },
  })

  console.log('✅ Kartu Keluarga created')

  // ===================== PENDUDUK =====================

  await prisma.penduduk.upsert({
    where: { nik: '3201000000000003' },
    update: {},
    create: {
      userId: wargaUser1.id,
      nik: '3201000000000003',
      noKK: kk1.noKK,
      nama: 'Budi Santoso',
      tempatLahir: 'Bogor',
      tanggalLahir: new Date('1985-05-15'),
      jenisKelamin: 'LAKI_LAKI',
      agama: 'ISLAM',
      statusKawin: 'KAWIN',
      pekerjaan: 'Petani',
      pendidikan: 'SMA',
      golonganDarah: 'O',
      alamat: 'Jl. Mawar No. 5',
      rt: '001',
      rw: '002',
      kelurahan: 'Sukamaju',
      kecamatan: 'Sukamaju',
      kabupaten: 'Bogor',
      provinsi: 'Jawa Barat',
      kodePos: '16911',
    },
  })

  await prisma.penduduk.upsert({
    where: { nik: '3201000000000004' },
    update: {},
    create: {
      userId: wargaUser2.id,
      nik: '3201000000000004',
      noKK: kk2.noKK,
      nama: 'Siti Rahayu',
      tempatLahir: 'Bogor',
      tanggalLahir: new Date('1990-08-20'),
      jenisKelamin: 'PEREMPUAN',
      agama: 'ISLAM',
      statusKawin: 'BELUM_KAWIN',
      pekerjaan: 'Pedagang',
      pendidikan: 'SMP',
      alamat: 'Jl. Melati No. 3',
      rt: '002',
      rw: '001',
      kelurahan: 'Sukamaju',
      kecamatan: 'Sukamaju',
      kabupaten: 'Bogor',
      provinsi: 'Jawa Barat',
      kodePos: '16911',
    },
  })

  console.log('✅ Penduduk created')

  // ===================== BANSOS =====================

  const penduduk1 = await prisma.penduduk.findUnique({ where: { nik: '3201000000000003' } })
  if (penduduk1) {
    await prisma.bansos.upsert({
      where: { id: 'bansos-1' },
      update: {},
      create: {
        id: 'bansos-1',
        pendudukId: penduduk1.id,
        jenisBansos: 'PKH',
        status: 'AKTIF',
        tahun: 2024,
        nominal: 3000000,
        keterangan: 'Penerima PKH tahun 2024',
        tanggalMulai: new Date('2024-01-01'),
        tanggalAkhir: new Date('2024-12-31'),
      },
    })
  }

  console.log('✅ Bansos created')

  // ===================== BERITA =====================

  await prisma.berita.upsert({
    where: { slug: 'selamat-datang-di-sidesaa' },
    update: {},
    create: {
      judul: 'Selamat Datang di SIDESAA',
      slug: 'selamat-datang-di-sidesaa',
      konten: 'SIDESAA adalah Sistem Informasi Desa Digital yang memudahkan warga dalam mengakses layanan desa secara online.\n\nDengan SIDESAA, warga dapat mengajukan surat keterangan, melaporkan pengaduan, dan memantau bantuan sosial dengan mudah dari mana saja.\n\nKami berkomitmen untuk terus meningkatkan pelayanan demi kepuasan warga Desa Sukamaju.',
      excerpt: 'SIDESAA hadir untuk memudahkan pelayanan desa secara digital.',
      kategori: 'Pengumuman',
      tags: ['sidesaa', 'digital', 'pelayanan'],
      isPublished: true,
      isPinned: true,
      publishedAt: new Date(),
      authorId: adminUser.id,
    },
  })

  await prisma.berita.upsert({
    where: { slug: 'jadwal-posyandu-bulan-ini' },
    update: {},
    create: {
      judul: 'Jadwal Posyandu Bulan Ini',
      slug: 'jadwal-posyandu-bulan-ini',
      konten: 'Posyandu Desa Sukamaju akan diadakan pada:\n\nDusun 1: Setiap Senin minggu pertama pukul 08.00 - 11.00\nDusun 2: Setiap Selasa minggu pertama pukul 08.00 - 11.00\n\nMohon kehadiran ibu-ibu yang memiliki balita.',
      excerpt: 'Jadwal lengkap posyandu untuk semua dusun di Desa Sukamaju.',
      kategori: 'Kesehatan',
      tags: ['posyandu', 'kesehatan', 'balita'],
      isPublished: true,
      isPinned: false,
      publishedAt: new Date(),
      authorId: adminUser.id,
    },
  })

  console.log('✅ Berita created')

  // ===================== INFRASTRUKTUR =====================

  await prisma.infrastruktur.createMany({
    skipDuplicates: true,
    data: [
      {
        nama: 'Jalan Raya Sukamaju',
        kategori: 'Jalan',
        lokasi: 'RT 001/002',
        deskripsi: 'Jalan utama desa sepanjang 2 km',
        kondisi: 'BAIK',
        status: 'BAIK',
      },
      {
        nama: 'Balai Desa',
        kategori: 'Gedung',
        lokasi: 'Pusat Desa',
        deskripsi: 'Kantor pemerintahan desa',
        kondisi: 'BAIK',
        status: 'BAIK',
      },
      {
        nama: 'Jembatan RT 003',
        kategori: 'Jembatan',
        lokasi: 'RT 003/001',
        deskripsi: 'Jembatan penghubung antar dusun',
        kondisi: 'RUSAK',
        status: 'PERLU PERBAIKAN',
        catatan: 'Retak di bagian tengah, perlu segera diperbaiki',
      },
      {
        nama: 'Masjid Al-Ikhlas',
        kategori: 'Ibadah',
        lokasi: 'RT 002/001',
        deskripsi: 'Masjid utama desa',
        kondisi: 'BAIK',
        status: 'BAIK',
      },
    ],
  })

  console.log('✅ Infrastruktur created')

  console.log('\n🎉 Seeding selesai!')
  console.log('\n📋 Akun yang tersedia:')
  console.log('  Admin  : admin@desa.id  / admin123')
  console.log('  Sekdes : sekdes@desa.id / admin123')
  console.log('  Warga  : warga@desa.id  / warga123')
  console.log('  Warga  : siti@desa.id   / warga123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })