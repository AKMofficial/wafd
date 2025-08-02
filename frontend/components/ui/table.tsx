import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-muted/50", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-start align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle text-start [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

interface DataTableColumn<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
  align?: 'left' | 'center' | 'right'
  mobile?: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  className?: string
  mobileView?: 'card' | 'table'
  onRowClick?: (row: T, index: number) => void
  emptyMessage?: string
  loading?: boolean
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  className,
  mobileView = 'card',
  onRowClick,
  emptyMessage = "لا توجد بيانات",
  loading = false,
}: DataTableProps<T>) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <svg 
          className="h-8 w-8 animate-spin text-primary-600" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <svg
          className="h-12 w-12 text-muted-foreground mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  if (isMobile && mobileView === 'card') {
    return (
      <div className={cn("space-y-4", className)}>
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-2",
              onRowClick && "cursor-pointer hover:bg-muted/50 transition-colors"
            )}
            onClick={() => onRowClick?.(row, rowIndex)}
          >
            {columns
              .filter(col => col.mobile !== false)
              .map((column, colIndex) => {
                const value = typeof column.accessor === 'function' 
                  ? column.accessor(row) 
                  : row[column.accessor]
                
                return (
                  <div key={colIndex} className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {column.header}
                    </span>
                    <span className="text-sm text-right rtl:text-left">
                      {value}
                    </span>
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead
              key={index}
              className={cn(
                column.align === 'center' && "text-center",
                column.align === 'left' && "text-left rtl:text-right",
                column.className
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            className={onRowClick ? "cursor-pointer" : ""}
            onClick={() => onRowClick?.(row, rowIndex)}
          >
            {columns.map((column, colIndex) => {
              const value = typeof column.accessor === 'function' 
                ? column.accessor(row) 
                : row[column.accessor]
              
              return (
                <TableCell
                  key={colIndex}
                  className={cn(
                    column.align === 'center' && "text-center",
                    column.align === 'left' && "text-left rtl:text-right",
                    column.className
                  )}
                >
                  {value}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
}