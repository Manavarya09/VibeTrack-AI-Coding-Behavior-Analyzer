import { Zap } from 'lucide-react'

export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} bg-black flex items-center justify-center animate-pulse`}>
        <Zap className={`${iconSizes[size]} text-white`} />
      </div>
    </div>
  )
}
