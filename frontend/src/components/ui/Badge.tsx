import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'primary' | 'soft' | 'gold' | 'success' | 'neutral'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-brand-primary text-white',
  soft: 'bg-brand-soft-pink text-brand-secondary',
  gold: 'bg-[#fef3c7] text-[#92400e]',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  neutral: 'bg-gray-100 text-gray-700',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px] font-medium',
  md: 'px-2.5 py-1 text-xs font-semibold',
}

export function Badge({
  variant = 'soft',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full leading-none'
  const combinedClasses =
    `${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()

  return (
    <span className={combinedClasses} {...props}>
      {children}
    </span>
  )
}
