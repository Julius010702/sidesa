import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

// Role didefinisikan manual — Prisma v6 tidak export enum langsung dari @prisma/client
export type Role =
  | 'WARGA'
  | 'ADMIN_DESA'
  | 'SEKDES'
  | 'KASI_PELAYANAN'
  | 'KAUR_UMUM'
  | 'RT_RW'

export interface JWTPayload {
  userId: string
  email: string
  role: Role
  nama: string
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('sidesaa_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function requireAdmin(): Promise<JWTPayload> {
  const session = await requireAuth()
  const adminRoles: Role[] = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']
  if (!adminRoles.includes(session.role)) throw new Error('Forbidden')
  return session
}

export function isAdminRole(role: Role): boolean {
  return ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW'].includes(role)
}