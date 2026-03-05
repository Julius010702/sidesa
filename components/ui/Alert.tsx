import { ReactNode } from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  onClose?: () => void
  className?: string
}

const styles: Record<AlertVariant, { wrap: string; icon: string }> = {
  info:    { wrap: 'bg-blue-50 border-blue-200 text-blue-800',   icon: 'ℹ️' },
  success: { wrap: 'bg-green-50 border-green-200 text-green-800', icon: '✅' },
  warning: { wrap: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: '⚠️' },
  error:   { wrap: 'bg-red-50 border-red-200 text-red-800',       icon: '❌' },
}

export default function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  const s = styles[variant]
  return (
    <div className={`flex gap-3 p-4 border rounded-xl text-sm ${s.wrap} ${className}`}>
      <span className="shrink-0 text-base">{s.icon}</span>
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  )
}