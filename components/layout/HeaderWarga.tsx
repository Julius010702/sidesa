import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Breadcrumb {
  label: string
  href?: string
}

interface HeaderWargaProps {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  action?: React.ReactNode
  className?: string
}

/**
 * HeaderWarga
 * Digunakan di setiap halaman portal warga sebagai judul halaman,
 * breadcrumb navigasi, dan slot untuk tombol aksi (misal: "Ajukan Surat", dll).
 *
 * Contoh pemakaian:
 * <HeaderWarga
 *   title="Pengajuan Surat"
 *   subtitle="Riwayat dan status surat kamu"
 *   breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Surat' }]}
 *   action={<Link href="/surat/ajukan">+ Ajukan Baru</Link>}
 * />
 */
export default function HeaderWarga({
  title,
  subtitle,
  breadcrumbs,
  action,
  className,
}: HeaderWargaProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 mb-2" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg
                  className="w-3.5 h-3.5 text-gray-300 shrink-0"
                  fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-xs text-gray-400 hover:text-green-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-xs text-gray-500 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Divider — warna hijau untuk warga */}
      <div className="mt-4 h-px bg-linear-to-r from-green-200 via-emerald-100 to-transparent" />
    </div>
  )
}