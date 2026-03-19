'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => {
  const variantStyles: Record<BadgeVariant, string> = {
    CONFIRMED: 'bg-black text-white',
    PENDING: 'bg-gray-200 text-black border border-gray-300',
    CANCELLED: 'bg-white text-gray-400 line-through border border-gray-300',
    COMPLETED: 'bg-gray-100 text-black border border-gray-200',
    NO_SHOW: 'bg-gray-300 text-gray-600 border border-gray-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
