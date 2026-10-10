import type { InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  startIcon?: ReactNode
  endIcon?: ReactNode
}

export function Input({
  id,
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  const errorId = error && inputId ? `${inputId}-error` : undefined
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined
  const describedBy = errorId || helperId || undefined

  const baseInputClasses =
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'

  const stateClasses = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
    : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'

  const paddingClasses = `${startIcon ? 'ps-10' : ''} ${endIcon ? 'pe-10' : ''}`.trim()
  const combinedClasses =
    `${baseInputClasses} ${stateClasses} ${paddingClasses} ${className}`.trim()

  return (
    <div className="w-full text-start">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-gray-700">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {startIcon && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
            {startIcon}
          </div>
        )}

        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          disabled={disabled}
          className={combinedClasses}
          {...props}
        />

        {endIcon && (
          <div className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400">
            {endIcon}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
