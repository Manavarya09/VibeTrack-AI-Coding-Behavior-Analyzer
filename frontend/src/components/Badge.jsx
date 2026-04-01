export function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: 'bg-gray-200 text-black border-black',
    primary: 'bg-black text-white border-black',
    success: 'bg-black text-white border-black',
    warning: 'bg-red-600 text-white border-black',
    danger: 'bg-red-600 text-white border-black',
    info: 'bg-black text-white border-black'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <span className={`inline-flex items-center font-black border-2 ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

export function Avatar({ src, alt, size = 'md', fallback }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} object-cover border-4 border-black`}
      />
    )
  }

  return (
    <div className={`${sizes[size]} bg-black text-white flex items-center justify-center font-black border-4 border-black`}>
      {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

export function ProgressBar({ value, max = 100, color = 'black', showLabel = true }) {
  const percentage = Math.min((value / max) * 100, 100)
  const colors = {
    black: 'bg-black',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-500'
  }

  return (
    <div className="w-full">
      <div className="h-4 bg-gray-200 border-2 border-black">
        <div
          className={`h-full ${colors[color] || 'bg-black'} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm font-black text-gray-500 mt-1">{Math.round(percentage)}%</p>
      )}
    </div>
  )
}
