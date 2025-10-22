'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from '@/lib/i18n';
import { useDebounce } from '@/hooks/use-debounce';
import { PilgrimFilters, PilgrimStatus, Gender } from '@/types/pilgrim';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockGroups } from '@/lib/mock-data';
import { useHallStore } from '@/store/hall-store';

interface PilgrimsFiltersProps {
  filters: PilgrimFilters;
  onFiltersChange: (filters: PilgrimFilters) => void;
  onReset: () => void;
}

export function PilgrimsFilters({
  filters,
  onFiltersChange,
  onReset,
}: PilgrimsFiltersProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  const debouncedSearch = useDebounce(searchValue, 300);

  const { halls, fetchHalls } = useHallStore();

  useEffect(() => {
    setSearchValue(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    fetchHalls();
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, []);

  useEffect(() => {
    if (debouncedSearch === filters.search) return;
    const nextFilters = { ...filters } as PilgrimFilters;
    if (!debouncedSearch) {
      delete nextFilters.search;
    } else {
      nextFilters.search = debouncedSearch;
    }
    onFiltersChange(nextFilters);
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      const { status, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, status: [value as PilgrimStatus] });
    }
  };

  const handleGenderChange = (value: string) => {
    if (value === 'all') {
      const { gender, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, gender: value as Gender });
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
            placeholder={t('pilgrims.filters.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={cn("pl-10", isRTL && "pl-3 pr-10")}
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="sm:w-auto"
        >
          <Filter className="h-4 w-4 me-2" />
          {t('pilgrims.filters.advancedFilters')}
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
            {t('pilgrims.filters.reset')}
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t('pilgrims.filters.status')}
              </label>
              <Select
                value={filters.status?.[0] || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('pilgrims.filters.all')}
                  </SelectItem>
                  <SelectItem value="expected">
                    {t('pilgrims.status.expected')}
                  </SelectItem>
                  <SelectItem value="arrived">
                    {t('pilgrims.status.arrived')}
                  </SelectItem>
                  <SelectItem value="departed">
                    {t('pilgrims.status.departed')}
                  </SelectItem>
                  <SelectItem value="no_show">
                    {t('pilgrims.status.noShow')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t('pilgrims.filters.gender')}
              </label>
              <Select
                value={filters.gender || 'all'}
                onValueChange={handleGenderChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('pilgrims.filters.all')}
                  </SelectItem>
                  <SelectItem value="male">
                    {t('pilgrims.form.male')}
                  </SelectItem>
                  <SelectItem value="female">
                    {t('pilgrims.form.female')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t('pilgrims.filters.specialNeeds')}
              </label>
              <Select
                value={filters.hasSpecialNeeds?.toString() || 'all'}
                onValueChange={handleSpecialNeedsChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('pilgrims.filters.all')}
                  </SelectItem>
                  <SelectItem value="true">
                    {t('pilgrims.filters.yes')}
                  </SelectItem>
                  <SelectItem value="false">
                    {t('pilgrims.filters.no')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t('pilgrims.filters.group')}
              </label>
              <SearchableSelect
                value={filters.group || ''}
                onValueChange={(value) => {
                  if (value === '') {
                    const { group, ...rest } = filters;
                    onFiltersChange(rest);
                  } else {
                    onFiltersChange({ ...filters, group: value });
                  }
                }}
                options={mockGroups.map(group => ({
                  value: group.id,
                  label: group.name
                }))}
                placeholder={t('pilgrims.filters.selectGroup')}
                searchPlaceholder={t('pilgrims.filters.searchGroups')}
                noResultsText={t('pilgrims.filters.noResults')}
                isRTL={isRTL}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {t('pilgrims.filters.hall')}
              </label>
              <SearchableSelect
                value={filters.hall || ''}
                onValueChange={(value) => {
                  if (value === '') {
                    const { hall, ...rest } = filters;
                    onFiltersChange(rest);
                  } else {
                    onFiltersChange({ ...filters, hall: value });
                  }
                }}
                options={halls.map(hall => ({
                  value: hall.id,
                  label: hall.name
                }))}
                placeholder={t('pilgrims.filters.selectHall')}
                searchPlaceholder={t('pilgrims.filters.searchHalls')}
                noResultsText={t('pilgrims.filters.noResults')}
                isRTL={isRTL}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-gray-600">
              {t('pilgrims.filters.activeFilters')}
            </span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;

              let label = '';
              if (key === 'search') {
                label = `${t('pilgrims.filters.search')}: ${value}`;
              } else if (key === 'status') {
                const statusValue = Array.isArray(value) ? value[0] : value;
                label = `${t('pilgrims.filters.status')}: ${t(`pilgrims.status.${statusValue}` as any) || statusValue}`;
              } else if (key === 'gender') {
                label = `${t('pilgrims.filters.gender')}: ${t(`pilgrims.form.${value}` as any) || value}`;
              } else if (key === 'hasSpecialNeeds') {
                label = value ? t('pilgrims.filters.specialNeeds') : '';
              } else if (key === 'group') {
                label = `${t('pilgrims.filters.group')}: ${value}`;
              } else if (key === 'hall') {
                label = `${t('pilgrims.filters.hall')}: ${value}`;
              }

              if (!label) return null;

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key as keyof PilgrimFilters];
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
