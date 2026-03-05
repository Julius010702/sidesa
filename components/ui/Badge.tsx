import { ReactNode } from 'react'

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'orange'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  dot?: boolean
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  green:  'bg-green-50 text-green-700 border-green-200',
  red:    'bg-red-50 text-red-600 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  blue:   'bg-blue-50 text-blue-600 border-blue-200',
  gray:   'bg-gray-100 text-gray-600 border-gray-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
}

const dotColors: Record<BadgeVariant, string> = {
  green:  'bg-green-500',
  red:    'bg-red-500',
  yellow: 'bg-yellow-500',
  blue:   'bg-blue-500',
  gray:   'bg-gray-400',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
}

export default function Badge({ variant = 'gray', children, dot, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}