import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Select component: styled dropdown using Tailwind.
 */
export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500',
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export const SelectOption = ({ value, children }) => (
  <option value={value}>{children}</option>
)
