import React, { useState } from 'react'
import { cn } from '../../lib/utils'

/**
 * Dialog component: simple modal overlay. isOpen controls visibility.
 */
export const Dialog = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50' onClick={onClose}>
      <div className={cn('bg-white rounded-lg shadow-lg p-6 max-w-md w-full', className)} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export const DialogTrigger = ({ asChild, children, onClick }) => {
  if (asChild) return React.cloneElement(children, { onClick })
  return <button onClick={onClick}>{children}</button>
}

export const DialogContent = ({ children, className }) => (
  <div className={cn('', className)}>{children}</div>
)

export const DialogHeader = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
)

export const DialogTitle = ({ children, className }) => (
  <h2 className={cn('text-lg font-semibold text-gray-900', className)}>{children}</h2>
)

export const DialogFooter = ({ children, className }) => (
  <div className={cn('mt-6 flex gap-2 justify-end', className)}>{children}</div>
)
