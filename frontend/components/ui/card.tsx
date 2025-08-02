import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    type: 'increase' | 'decrease'
  }
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, description, icon, trend, ...props }, ref) => (
    <Card ref={ref} className={cn("hover:shadow-md", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-xs">
                <span
                  className={cn(
                    "font-medium",
                    trend.type === 'increase' ? "text-success-600" : "text-error-600"
                  )}
                >
                  {trend.type === 'increase' ? '↑' : '↓'} {trend.value}%
                </span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="rounded-full bg-primary-100 p-3 text-primary-600">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
)
StatCard.displayName = "StatCard"

interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode
}

const InfoCard = React.forwardRef<HTMLDivElement, InfoCardProps>(
  ({ className, variant = 'default', title, icon, children, ...props }, ref) => {
    const variants = {
      default: "border-border bg-card",
      success: "border-success-200 bg-success-50",
      warning: "border-warning-200 bg-warning-50",
      error: "border-error-200 bg-error-50",
      info: "border-primary-200 bg-primary-50",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border p-4",
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex space-x-3 rtl:space-x-reverse">
          {icon && (
            <div className="flex-shrink-0">{icon}</div>
          )}
          <div className="flex-1 space-y-1">
            {title && (
              <h4 className="text-sm font-medium">{title}</h4>
            )}
            <div className="text-sm text-muted-foreground">{children}</div>
          </div>
        </div>
      </div>
    )
  }
)
InfoCard.displayName = "InfoCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  InfoCard,
}