import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Table components: styled table using Tailwind.
 */
export const Table = React.forwardRef(({ className, ...props }, ref) => (
  <table ref={ref} className={cn('w-full border-collapse', className)} {...props} />
))
Table.displayName = 'Table'

export const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-gray-100 border-b border-gray-300', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

export const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('', className)} {...props} />
))
TableBody.displayName = 'TableBody'

export const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('border-b border-gray-200 hover:bg-gray-50', className)} {...props} />
))
TableRow.displayName = 'TableRow'

export const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th ref={ref} className={cn('text-left px-4 py-2 font-semibold text-gray-900', className)} {...props} />
))
TableHead.displayName = 'TableHead'

export const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-4 py-2 text-gray-900', className)} {...props} />
))
TableCell.displayName = 'TableCell'
