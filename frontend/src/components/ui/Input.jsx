import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Input component: styled text input using Tailwind.
 */
export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'px-3 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'
