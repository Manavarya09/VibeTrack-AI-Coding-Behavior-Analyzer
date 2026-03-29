export function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-indigo-100 text-indigo-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }
  
  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}>
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
        className={`${sizes[size]} rounded-full object-cover border-2 border-black`}
      />
    )
  }
  
  return (
    <div className={`${sizes[size]} rounded-full bg-black text-white flex items-center justify-center font-bold border-2 border-black`}>
      {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

export function ProgressBar({ value, max = 100, color = 'indigo', showLabel = true }) {
  const percentage = Math.min((value / max) * 100, 100)
  const colors = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    blue: 'bg-blue-600'
  }
  
  return (
    <div className="w-full">
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
        <div 
          className={`h-full ${colors[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-1 font-medium">{Math.round(percentage)}%</p>
      )}
    </div>
  )
}
