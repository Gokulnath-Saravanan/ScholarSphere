import React, { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input: React.FC<InputProps> = ({
  className,
  error,
  label,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-scholar-500 mb-1">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all',
          error
            ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
            : 'border-scholar-300 focus:border-scholar-500 focus:ring-scholar-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
