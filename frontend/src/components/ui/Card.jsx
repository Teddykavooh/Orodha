import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Card component: container with border and shadow.
 */
export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)} {...props} />
))
Card.displayName = 'Card'

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pb-0', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
))
CardTitle.displayName = 'CardTitle'
