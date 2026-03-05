import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AdminStatCard {
  label: string
  value: number | string
  subLabel?: string
  href?: string
  color: 'blue' | 'amber' | 'red' | 'green' | 'purple' | 'teal'
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
}

const colorMap = {
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
    border: 'border-blue-100',
    hover: 'hover:border-blue-200',
    trend: 'text-blue-600 bg-blue-50',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
    border: 'border-amber-100',
    hover: 'hover:border-amber-200',
    trend: 'text-amber-600 bg-amber-50',
  },
  red: {
    icon: 'bg-red-100 text-red-600',
    value: 'text-red-700',
    border: 'border-red-100',
    hover: 'hover:border-red-200',
    trend: 'text-red-600 bg-red-50',
  },
  green: {
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-700',
    border: 'border-green-100',
    hover: 'hover:border-green-200',
    trend: 'text-green-600 bg-green-50',
  },
  purple: {
    icon: 'bg-purple-100 text-purple-600',
    value: 'text-purple-700',
    border: 'border-purple-100',
    hover: 'hover:border-purple-200',
    trend: 'text-purple-600 bg-purple-50',
  },
  teal: {
    icon: 'bg-teal-100 text-teal-600',
    value: 'text-teal-700',
    border: 'border-teal-100',
    hover: 'hover:border-teal-200',
    trend: 'text-teal-600 bg-teal-50',
  },
}

interface DashboardAdminStatsProps {
  stats: AdminStatCard[]
}

export default function DashboardAdminStats({ stats }: DashboardAdminStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((stat, i) => {
        const c = colorMap[stat.color]
        const Wrapper = stat.href ? Link : 'div'
        const wrapperProps = stat.href ? { href: stat.href } : {}

        return (
          // @ts-expect-error dynamic tag
          <Wrapper
            key={i}
            {...wrapperProps}
            className={cn(
              'bg-white border rounded-2xl p-4 transition-all duration-200',
              c.border,
              stat.href && cn('cursor-pointer group', c.hover, 'hover:shadow-sm')
            )}
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', c.icon)}>
              {stat.icon}
            </div>
            <div className={cn('text-2xl font-bold tabular-nums leading-none', c.value)}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 font-medium mt-1 leading-tight">{stat.label}</div>
            {stat.subLabel && (
              <div className="text-xs text-gray-400 mt-0.5">{stat.subLabel}</div>
            )}
            {stat.trend && (
              <div className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-2', c.trend)}>
                {stat.trend.positive !== false ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {stat.trend.label}
              </div>
            )}
          </Wrapper>
        )
      })}
    </div>
  )
}