interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'white' | 'gray'
  className?: string
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
const colors = { green: 'border-green-600', white: 'border-white', gray: 'border-gray-400' }

export default function Spinner({ size = 'md', color = 'green', className = '' }: SpinnerProps) {
  return (
    <div
      className={`${sizes[size]} border-2 border-t-transparent rounded-full animate-spin ${colors[color]} ${className}`}
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
      <Spinner size="lg" />
    </div>
  )
}