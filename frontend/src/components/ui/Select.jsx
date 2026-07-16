import React from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown } from "lucide-react";

/**
 * Select component: styled dropdown using Tailwind.
 */
const sizes = {
  sm: "h-9 text-sm px-3",
  md: "h-10 text-sm px-3",
  lg: "h-11 text-base px-4",
};

export const Select = React.forwardRef(
  (
    {
      className,
      label,
      helperText,
      error,
      size = "md",
      placeholder,
      disabled = false,
      loading = false,
      fullWidth = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("space-y-1", fullWidth && "w-full")}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            disabled={disabled || loading}
            className={cn(
              "appearance-none rounded-lg border bg-white transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed",
              "pr-10",
              sizes[size],
              fullWidth && "w-full",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 hover:border-gray-400",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {loading ? (
              <option>Loading...</option>
            ) : (
              children
            )}
          </select>

          <ChevronDown
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>

        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export const SelectOption = ({ value, children, disabled }) => (
  <option value={value} disabled={disabled}>
    {children}
  </option>
);
