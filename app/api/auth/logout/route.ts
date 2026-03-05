import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { COOKIE_NAME } from '@/lib/constants'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (token) {
      // Hapus session dari database
      await prisma.session.deleteMany({ where: { token } }).catch(() => {
        // Tidak apa-apa jika session sudah tidak ada
      })

      // Hapus cookie
      cookieStore.delete(COOKIE_NAME)
    }

    return NextResponse.json({ success: true, message: 'Berhasil logout' })
  } catch (error) {
    console.error('[LOGOUT ERROR]', error)
    return NextResponse.json(
      { error: 'Gagal logout' },
      { status: 500 }
    )
  }
}