import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-100 text-primary-700",
        secondary: "border-transparent bg-secondary-100 text-secondary-700",
        success: "border-transparent bg-success-100 text-success-700",
        warning: "border-transparent bg-warning-100 text-warning-700",
        error: "border-transparent bg-error-100 text-error-700",
        outline: "border border-border text-foreground",
        ghost: "hover:bg-muted text-foreground",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.25 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, removable, onRemove, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon && (
          <span className="mr-1 rtl:mr-0 rtl:ml-1">{icon}</span>
        )}
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 rtl:ml-0 rtl:mr-1 hover:opacity-75 focus:outline-none"
            aria-label="Remove"
          >
            <svg
              className="h-3 w-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Badge.displayName = "Badge"

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'occupied' | 'vacant' | 'reserved' | 'maintenance' | 'arrived' | 'not-arrived'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const statusConfig = {
    occupied: { variant: 'success' as const, label: 'مشغول' },
    vacant: { variant: 'outline' as const, label: 'شاغر' },
    reserved: { variant: 'warning' as const, label: 'محجوز' },
    maintenance: { variant: 'error' as const, label: 'صيانة' },
    arrived: { variant: 'success' as const, label: 'وصل' },
    'not-arrived': { variant: 'secondary' as const, label: 'لم يصل' },
  }
  
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  )
}

export { Badge, badgeVariants, StatusBadge }