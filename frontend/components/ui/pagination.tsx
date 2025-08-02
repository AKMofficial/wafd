'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  locale?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  locale = 'ar'
}: PaginationProps) {
  const isRTL = locale === 'ar';
  
  const pages = [];
  const maxVisible = 5;
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const previousLabel = locale === 'ar' ? 'السابق' : 'Previous';
  const nextLabel = locale === 'ar' ? 'التالي' : 'Next';

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        {isRTL ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {start > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            className="h-8 w-8"
          >
            1
          </Button>
          {start > 2 && <span className="px-2 text-gray-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(page)}
          className="h-8 w-8"
        >
          {page}
        </Button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            className="h-8 w-8"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        {isRTL ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}