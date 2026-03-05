import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

const pxSizes = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 }

function getInitials(name?: string) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function getBgColor(name?: string) {
  const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
  if (!name) return colors[0]
  return colors[name.charCodeAt(0) % colors.length]
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const px = pxSizes[size]
  if (src) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden shrink-0 relative ${className}`}>
        <Image src={src} alt={name || 'avatar'} width={px} height={px} className="object-cover w-full h-full" />
      </div>
    )
  }
  return (
    <div
      className={`${sizes[size]} ${getBgColor(name)} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}