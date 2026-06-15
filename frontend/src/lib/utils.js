/**
 * Utility function to merge Tailwind classes with clsx-like functionality.
 * Used by Shadcn components to conditionally apply classNames.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
