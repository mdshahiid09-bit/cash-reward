import React, { useState } from 'react'

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = ''
}) => {
  const [hasError, setHasError] = useState(false)

  // Derive initials from name (e.g. "Official Shahid" -> "O" or "OS")
  const getInitials = (fullName?: string | null) => {
    if (!fullName || !fullName.trim()) return 'U'
    const parts = fullName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl'
  }[size]

  const showImage = src && !hasError

  if (showImage) {
    return (
      <img
        src={src}
        alt={name || 'User Avatar'}
        onError={() => setHasError(true)}
        className={`${sizeClasses} rounded-full object-cover border-2 border-emerald-500/40 shadow-sm shrink-0 ${className}`}
      />
    )
  }

  const initials = getInitials(name)

  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-600 text-slate-950 font-extrabold flex items-center justify-center font-heading border-2 border-emerald-500/40 shadow-md shadow-emerald-500/10 shrink-0 select-none ${className}`}
    >
      {initials}
    </div>
  )
}
