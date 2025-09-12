'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from '@/lib/i18n';
import { useHallStore } from '@/store/hall-store';
import { HallsTable } from '@/components/halls/halls-table';
import { CreateHallDialog } from '@/components/halls/create-hall-dialog';
import { HallsFilters, HallFilters } from '@/components/halls/halls-filters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { Plus, Building, Users, Bed, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Hall } from '@/types/hall';

export default function HallsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const [mounted, setMounted] = useState(false);
  const [showCreateHall, setShowCreateHall] = useState(false);
  const [filters, setFilters] = useState<HallFilters>({});
  const [paginatedData, setPaginatedData] = useState<any>(null);
  
  const {
    halls,
    isLoading,
    fetchHalls,
    getStatistics,
    pagination,
    setPagination,
  } = useHallStore();
  
  const stats = getStatistics();
  
  const loadHalls = async () => {
    const result = await fetchHalls();
    setPaginatedData(result);
  };
  
  const handlePageChange = (page: number) => {
    setPagination({ page });
  };
  
  useEffect(() => {
    setMounted(true);
    loadHalls();
  }, []);
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadHalls();
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [filters, pagination]);
  
  const filteredHalls = halls.filter(hall => {
    if (filters.search && !hall.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !hall.code.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type && hall.type !== filters.type) {
      return false;
    }
    if (filters.status) {
      const occupancyRate = hall.capacity > 0 ? (hall.currentOccupancy / hall.capacity) * 100 : 0;
      if (filters.status === 'full' && occupancyRate < 100) return false;
      if (filters.status === 'available' && occupancyRate >= 100) return false;
    }
    if (filters.hasSpecialNeeds !== undefined) {
      if (filters.hasSpecialNeeds && hall.specialNeedsOccupancy === 0) return false;
      if (!filters.hasSpecialNeeds && hall.specialNeedsOccupancy > 0) return false;
    }
    return true;
  });
  
  const handleAddNewHall = () => {
    setShowCreateHall(true);
  };
  
  // Prevent hydration errors by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {t('nav.halls')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                إدارة القاعات وتوزيع الأسرّة
              </p>
            </div>
            <Button className="w-full sm:w-auto" onClick={handleAddNewHall}>
              <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              إضافة قاعة جديدة
            </Button>
          </div>
        </div>
        
        
        {/* Filters */}
        <div className="mb-6">
          <HallsFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters({})}
          />
        </div>
        
        {/* Halls Table */}
        <div className="w-full">
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-xl font-semibold">جميع القاعات</h2>
            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-blue-600">●</span>
                رجال: {stats.maleHalls.occupied}/{stats.maleHalls.beds}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-pink-600">●</span>
                نساء: {stats.femaleHalls.occupied}/{stats.femaleHalls.beds}
              </span>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <HallsTable halls={filteredHalls} />
              {paginatedData && paginatedData.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <p className="text-sm text-gray-600 text-center sm:text-start">
                    عرض {(pagination.page - 1) * pagination.limit + 1} إلى {Math.min(pagination.page * pagination.limit, paginatedData.total)} من {paginatedData.total}
                  </p>
                  
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={paginatedData.totalPages}
                    onPageChange={handlePageChange}
                    locale={locale}
                  />
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Create Hall Dialog */}
        <CreateHallDialog
          isOpen={showCreateHall}
          onClose={() => setShowCreateHall(false)}
          onSuccess={() => loadHalls()}
        />
      </div>
    </main>
  );
}