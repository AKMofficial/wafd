'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { PilgrimsTable } from '@/components/pilgrims/pilgrims-table';
import { PilgrimsFilters } from '@/components/pilgrims/pilgrims-filters';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Upload, 
  Users, 
  UserCheck, 
  Clock, 
  AlertCircle,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { Pilgrim } from '@/types/pilgrim';
import { ExcelImportDialog } from '@/components/pilgrims/excel-import-dialog';

export default function PilgrimsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [paginatedData, setPaginatedData] = useState<any>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const {
    pilgrims,
    filters,
    pagination,
    isLoading,
    error,
    fetchPilgrims,
    setFilters,
    setPagination,
    resetFilters,
    getStatistics,
    markArrival
  } = usePilgrimStore();

  const stats = isMounted ? getStatistics() : {
    total: 0,
    arrived: 0,
    expected: 0,
    departed: 0,
    noShow: 0,
    specialNeeds: 0,
    maleCount: 0,
    femaleCount: 0,
    occupancyRate: 0,
    byNationality: {},
    byAgeGroup: {}
  };

  useEffect(() => {
    setIsMounted(true);
    loadPilgrims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination]);

  const loadPilgrims = async () => {
    const result = await fetchPilgrims();
    setPaginatedData(result);
  };

  const handlePageChange = (page: number) => {
    setPagination({ page });
  };

  const handleMarkArrival = async (pilgrim: Pilgrim) => {
    try {
      await markArrival(pilgrim.id, new Date());
      loadPilgrims();
    } catch (error) {
      console.error('Failed to mark arrival:', error);
    }
  };

  const statsCards = [
    {
      title: locale === 'ar' ? 'إجمالي الحجاج' : 'Total Pilgrims',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: locale === 'ar' ? 'وصلوا' : 'Arrived',
      value: stats.arrived,
      icon: UserCheck,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: locale === 'ar' ? 'متوقع وصولهم' : 'Expected',
      value: stats.expected,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      title: locale === 'ar' ? 'احتياجات خاصة' : 'Special Needs',
      value: stats.specialNeeds,
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <main className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t('nav.pilgrims')}
          </h1>
          <p className="text-gray-600">
            {locale === 'ar' ? 'إدارة بيانات الحجاج وتتبع حالتهم' : 'Manage pilgrim data and track their status'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  {isLoading || !isMounted ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {(() => {
                    const IconComponent = stat.icon;
                    return <IconComponent className="h-5 w-5" />;
                  })()}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold">
              {locale === 'ar' ? 'قائمة الحجاج' : 'Pilgrims List'}
            </h2>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                className="flex-1 sm:flex-none"
                onClick={() => router.push(`/${locale}/pilgrims/new`)}
              >
                <Plus className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'إضافة حاج' : 'Add Pilgrim'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'استيراد' : 'Import'}
              </Button>
              <Button variant="outline" size="icon">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <PilgrimsFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
            />

            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                {error}
              </div>
            )}

            <PilgrimsTable
              pilgrims={pilgrims}
              isLoading={isLoading}
              onView={(pilgrim) => router.push(`/${locale}/pilgrims/${pilgrim.id}`)}
              onEdit={(pilgrim) => router.push(`/${locale}/pilgrims/${pilgrim.id}/edit`)}
              onMarkArrival={handleMarkArrival}
            />

            {paginatedData && paginatedData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <p className="text-sm text-gray-600 text-center sm:text-start">
                  {locale === 'ar' 
                    ? `عرض ${(pagination.page - 1) * pagination.limit + 1} إلى ${Math.min(pagination.page * pagination.limit, paginatedData.total)} من ${paginatedData.total}` 
                    : `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(pagination.page * pagination.limit, paginatedData.total)} of ${paginatedData.total}`
                  }
                </p>
                
                <Pagination
                  currentPage={pagination.page}
                  totalPages={paginatedData.totalPages}
                  onPageChange={handlePageChange}
                  locale={locale}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      <ExcelImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportComplete={(result) => {
          if (result.success) {
            loadPilgrims();
          }
        }}
      />
    </main>
  );
}