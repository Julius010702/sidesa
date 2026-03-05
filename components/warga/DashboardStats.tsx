import Link from 'next/link'
import { cn } from '@/lib/utils'

interface StatCard {
  label: string
  value: number | string
  description?: string
  href?: string
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'teal'
  icon: React.ReactNode
  trend?: {
    label: string
    positive?: boolean
  }
}

const colorMap = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    hover: 'hover:border-green-300 hover:bg-green-50/80',
    dot: 'bg-green-400',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    hover: 'hover:border-blue-300 hover:bg-blue-50/80',
    dot: 'bg-blue-400',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    hover: 'hover:border-amber-300 hover:bg-amber-50/80',
    dot: 'bg-amber-400',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    icon: 'bg-red-100 text-red-600',
    value: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    hover: 'hover:border-red-300 hover:bg-red-50/80',
    dot: 'bg-red-400',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    icon: 'bg-purple-100 text-purple-600',
    value: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700',
    hover: 'hover:border-purple-300 hover:bg-purple-50/80',
    dot: 'bg-purple-400',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    icon: 'bg-teal-100 text-teal-600',
    value: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-700',
    hover: 'hover:border-teal-300 hover:bg-teal-50/80',
    dot: 'bg-teal-400',
  },
}

interface DashboardStatsProps {
  stats: StatCard[]
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              'relative bg-white border rounded-2xl p-4 transition-all duration-200',
              c.border,
              stat.href && cn('cursor-pointer', c.hover, 'group')
            )}
          >
            {/* Icon */}
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', c.icon)}>
              {stat.icon}
            </div>

            {/* Value */}
            <div className={cn('text-2xl font-bold tabular-nums', c.value)}>
              {stat.value}
            </div>

            {/* Label */}
            <div className="text-sm text-gray-500 font-medium mt-0.5">{stat.label}</div>

            {/* Description or trend */}
            {(stat.description || stat.trend) && (
              <div className="mt-2">
                {stat.trend && (
                  <span className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                    c.badge
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
                    {stat.trend.label}
                  </span>
                )}
                {stat.description && !stat.trend && (
                  <p className="text-xs text-gray-400">{stat.description}</p>
                )}
              </div>
            )}

            {/* Arrow for link cards */}
            {stat.href && (
              <div className="absolute top-4 right-4 text-gray-300 group-hover:text-gray-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </Wrapper>
        )
      })}
    </div>
  )
}