import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              transition-shadow
              ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}
              ${leftIcon ? 'pl-9' : ''}
              ${rightIcon ? 'pr-9' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input