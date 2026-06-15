import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Button component: simple styled button using Tailwind classes.
 * Props: variant ('default', 'destructive', 'outline'), size ('sm', 'md', 'lg'), etc.
 */
export const Button = React.forwardRef(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  const baseClasses = 'font-semibold rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
  }
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }
  return (
    <button
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
})
Button.displayName = 'Button'
