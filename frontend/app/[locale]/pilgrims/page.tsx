'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { useAuth } from '@/lib/auth';
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
  Accessibility,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { Pilgrim } from '@/types/pilgrim';
import { ExcelImportDialog } from '@/components/pilgrims/excel-import-dialog';

export default function PilgrimsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { canEdit, canDelete, isAdmin } = useAuth();
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
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }
    }
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
      title: t('dashboard.stats.totalPilgrims'),
      value: stats?.total || 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: t('dashboard.stats.arrived'),
      value: stats?.arrived || 0,
      icon: UserCheck,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: t('dashboard.stats.expected'),
      value: stats?.expected || 0,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      title: t('dashboard.stats.specialNeeds'),
      value: stats?.specialNeeds || 0,
      icon: Accessibility,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <main className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {t('nav.pilgrims')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t('pilgrims.subtitle')}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="flex-1 sm:flex-none"
                onClick={() => router.push(`/${locale}/pilgrims/new`)}
              >
                <Plus className="h-4 w-4 me-2" />
                {t('pilgrims.addPilgrim')}
              </Button>
              {isAdmin() && (
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="h-4 w-4 me-2" />
                  {t('pilgrims.import')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <PilgrimsFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />
        </div>
        
        {/* Table */}
        <div className="w-full">
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-xl font-semibold">{t('pilgrims.allPilgrims')}</h2>
            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-blue-600">●</span>
                {t('common.total')}: {stats?.total || 0}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-600">●</span>
                {t('dashboard.stats.arrived')}: {stats?.arrived || 0}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-yellow-600">●</span>
                {t('dashboard.stats.expected')}: {stats?.expected || 0}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-purple-600">●</span>
                {t('dashboard.stats.specialNeeds')}: {stats?.specialNeeds || 0}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
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
                {t('pilgrims.showing')} {(pagination.page - 1) * pagination.limit + 1} {t('pilgrims.to')} {Math.min(pagination.page * pagination.limit, paginatedData.total)} {t('pilgrims.of')} {paginatedData.total}
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