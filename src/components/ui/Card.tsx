'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  title?: string
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg',
        paddingStyles[padding],
        className
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold text-black mb-4">{title}</h3>
      )}
      {children}
    </div>
  )
}
