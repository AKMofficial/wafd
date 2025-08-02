import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  hint?: string
  onCheckedChange?: (checked: boolean) => void
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className,
    label,
    error,
    hint,
    onCheckedChange,
    onChange,
    ...props 
  }, ref) => {
    const checkboxId = React.useId()
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Call the native onChange if provided
      if (onChange) {
        onChange(event)
      }
      // Call onCheckedChange if provided
      if (onCheckedChange) {
        onCheckedChange(event.target.checked)
      }
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <div className="flex items-center h-5">
            <input
              id={checkboxId}
              type="checkbox"
              className={cn(
                "h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 transition-colors duration-200 cursor-pointer",
                error && "border-error-500",
                className
              )}
              ref={ref}
              onChange={handleChange}
              {...props}
            />
          </div>
          {label && (
            <label 
              htmlFor={checkboxId} 
              className="text-sm font-medium text-foreground cursor-pointer select-none"
            >
              {label}
            </label>
          )}
        </div>
        {hint && !error && (
          <p className="text-sm text-muted-foreground ml-7 rtl:ml-0 rtl:mr-7">{hint}</p>
        )}
        {error && (
          <p className="text-sm text-error-500 ml-7 rtl:ml-0 rtl:mr-7">{error}</p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className,
    label,
    ...props 
  }, ref) => {
    const radioId = React.useId()
    
    return (
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <input
          id={radioId}
          type="radio"
          className={cn(
            "h-4 w-4 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 transition-colors duration-200 cursor-pointer",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label 
            htmlFor={radioId} 
            className="text-sm font-medium text-foreground cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Radio.displayName = "Radio"

export interface RadioGroupProps {
  label?: string
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  error,
  hint,
  children,
  className
}) => {
  return (
    <fieldset className={cn("space-y-2", className)}>
      {label && (
        <legend className="text-sm font-medium text-foreground mb-3">
          {label}
        </legend>
      )}
      <div className="space-y-2">
        {children}
      </div>
      {hint && !error && (
        <p className="text-sm text-muted-foreground mt-2">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-error-500 mt-2">{error}</p>
      )}
    </fieldset>
  )
}

export { Checkbox, Radio, RadioGroup }