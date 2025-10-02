'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HallFilters {
  search?: string;
  type?: 'male' | 'female';
  status?: 'available' | 'full';
  hasSpecialNeeds?: boolean;
}

interface HallsFiltersProps {
  filters: HallFilters;
  onFiltersChange: (filters: HallFilters) => void;
  onReset: () => void;
}

export function HallsFilters({
  filters,
  onFiltersChange,
  onReset,
}: HallsFiltersProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleTypeChange = (value: string) => {
    if (value === 'all') {
      const { type, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, type: value as 'male' | 'female' });
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      const { status, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, status: value as 'available' | 'full' });
    }
  };

  const handleSpecialNeedsChange = (value: string) => {
    if (value === 'all') {
      const { hasSpecialNeeds, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, hasSpecialNeeds: value === 'true' });
    }
  };


  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className={cn(
            "absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4",
            isRTL ? "right-3" : "left-3"
          )} />
          <Input
            type="text"
            placeholder={t('halls.filters.searchPlaceholder')}
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn("pl-10", isRTL && "pl-3 pr-10")}
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="sm:w-auto"
        >
          <Filter className="h-4 w-4 me-2" />
          {t('halls.filters.advancedFilters')}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ms-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={onReset}
            className="sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 me-2" />
            {t('halls.filters.reset')}
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t('halls.filters.typeLabel')}
              </label>
              <Select
                value={filters.type || 'all'}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('halls.filters.allOption')}</SelectItem>
                  <SelectItem value="male">{t('halls.filters.male')}</SelectItem>
                  <SelectItem value="female">{t('halls.filters.female')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t('halls.filters.statusLabel')}
              </label>
              <Select
                value={filters.status || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('halls.filters.allOption')}</SelectItem>
                  <SelectItem value="full">{t('halls.filters.full')}</SelectItem>
                  <SelectItem value="available">{t('halls.filters.notFull')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t('halls.filters.specialNeedsLabel')}
              </label>
              <Select
                value={filters.hasSpecialNeeds?.toString() || 'all'}
                onValueChange={handleSpecialNeedsChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('halls.filters.allOption')}</SelectItem>
                  <SelectItem value="true">{t('halls.filters.hasSpecialNeeds')}</SelectItem>
                  <SelectItem value="false">{t('halls.filters.noSpecialNeeds')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-gray-600">
              {t('halls.filters.activeFiltersLabel')}
            </span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;

              let label = '';
              if (key === 'search') {
                label = `${t('halls.filters.searchFilter')}: ${value}`;
              } else if (key === 'type') {
                const typeLabel = value === 'male' ? t('halls.filters.male') : t('halls.filters.female');
                label = `${t('halls.filters.genderFilter')}: ${typeLabel}`;
              } else if (key === 'status') {
                const statusLabel = value === 'full' ? t('halls.filters.full') : t('halls.filters.notFull');
                label = `${t('halls.filters.statusFilter')}: ${statusLabel}`;
              } else if (key === 'hasSpecialNeeds') {
                label = value ? t('halls.filters.hasSpecialNeedsFilter') : t('halls.filters.noSpecialNeedsFilter');
              }

              if (!label) return null;
              
              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key as keyof HallFilters];
                    onFiltersChange(newFilters);
                  }}
                >
                  {label}
                  <X className="h-3 w-3 ms-1" />
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}