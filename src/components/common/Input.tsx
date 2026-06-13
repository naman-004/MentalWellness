import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={clsx(
            'w-full p-2.5 bg-bg border rounded-md text-text-primary text-sm focus:outline-none transition duration-150',
            error ? 'border-danger focus:border-danger' : 'border-border focus:border-accent',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger font-medium mt-1">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
