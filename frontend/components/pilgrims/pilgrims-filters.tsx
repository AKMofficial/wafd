'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from '@/lib/i18n';
import { PilgrimFilters, PilgrimStatus, Gender } from '@/types/pilgrim';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            placeholder={locale === 'ar' ? 'البحث بالاسم أو رقم التسجيل أو الهاتف...' : 'Search by name, registration, or phone...'}
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
          {locale === 'ar' ? 'تصفية متقدمة' : 'Advanced Filters'}
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
            {locale === 'ar' ? 'إعادة تعيين' : 'Reset'}
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {locale === 'ar' ? 'الحالة' : 'Status'}
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
                    {locale === 'ar' ? 'الكل' : 'All'}
                  </SelectItem>
                  <SelectItem value="expected">
                    {locale === 'ar' ? 'متوقع' : 'Expected'}
                  </SelectItem>
                  <SelectItem value="arrived">
                    {locale === 'ar' ? 'وصل' : 'Arrived'}
                  </SelectItem>
                  <SelectItem value="departed">
                    {locale === 'ar' ? 'غادر' : 'Departed'}
                  </SelectItem>
                  <SelectItem value="no_show">
                    {locale === 'ar' ? 'لم يحضر' : 'No Show'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {locale === 'ar' ? 'الجنس' : 'Gender'}
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
                    {locale === 'ar' ? 'الكل' : 'All'}
                  </SelectItem>
                  <SelectItem value="male">
                    {locale === 'ar' ? 'ذكر' : 'Male'}
                  </SelectItem>
                  <SelectItem value="female">
                    {locale === 'ar' ? 'أنثى' : 'Female'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {locale === 'ar' ? 'احتياجات خاصة' : 'Special Needs'}
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
                    {locale === 'ar' ? 'الكل' : 'All'}
                  </SelectItem>
                  <SelectItem value="true">
                    {locale === 'ar' ? 'نعم' : 'Yes'}
                  </SelectItem>
                  <SelectItem value="false">
                    {locale === 'ar' ? 'لا' : 'No'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {locale === 'ar' ? 'المجموعة' : 'Group'}
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
                options={[
                  { value: 'مجموعة الرحمة', label: 'مجموعة الرحمة' },
                  { value: 'مجموعة البركة', label: 'مجموعة البركة' },
                  { value: 'مجموعة النور', label: 'مجموعة النور' },
                  { value: 'مجموعة الهداية', label: 'مجموعة الهداية' },
                  { value: 'مجموعة السلام', label: 'مجموعة السلام' },
                  { value: 'مجموعة الفجر', label: 'مجموعة الفجر' },
                  { value: 'مجموعة الأمل', label: 'مجموعة الأمل' },
                  { value: 'مجموعة الخير', label: 'مجموعة الخير' }
                ]}
                placeholder={locale === 'ar' ? 'اختر المجموعة' : 'Select Group'}
                searchPlaceholder={locale === 'ar' ? 'البحث في المجموعات...' : 'Search groups...'}
                noResultsText={locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                isRTL={isRTL}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {locale === 'ar' ? 'القاعة' : 'Hall'}
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
                options={[
                  { value: 'القاعة الأولى', label: 'القاعة الأولى' },
                  { value: 'القاعة الثانية', label: 'القاعة الثانية' },
                  { value: 'القاعة الثالثة', label: 'القاعة الثالثة' },
                  { value: 'القاعة الرابعة', label: 'القاعة الرابعة' },
                  { value: 'القاعة الخامسة', label: 'القاعة الخامسة' },
                  { value: 'القاعة السادسة', label: 'القاعة السادسة' },
                  { value: 'قاعة الرجال أ', label: 'قاعة الرجال أ' },
                  { value: 'قاعة الرجال ب', label: 'قاعة الرجال ب' },
                  { value: 'قاعة النساء أ', label: 'قاعة النساء أ' },
                  { value: 'قاعة النساء ب', label: 'قاعة النساء ب' }
                ]}
                placeholder={locale === 'ar' ? 'اختر القاعة' : 'Select Hall'}
                searchPlaceholder={locale === 'ar' ? 'البحث في القاعات...' : 'Search halls...'}
                noResultsText={locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                isRTL={isRTL}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-gray-600">
              {locale === 'ar' ? 'الفلاتر النشطة:' : 'Active filters:'}
            </span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              let label = '';
              if (key === 'search') {
                label = `${locale === 'ar' ? 'بحث' : 'Search'}: ${value}`;
              } else if (key === 'status') {
                const statusLabels: Record<string, string> = {
                  expected: locale === 'ar' ? 'متوقع' : 'Expected',
                  arrived: locale === 'ar' ? 'وصل' : 'Arrived',
                  departed: locale === 'ar' ? 'غادر' : 'Departed',
                  no_show: locale === 'ar' ? 'لم يحضر' : 'No Show',
                };
                const statusValue = Array.isArray(value) ? value[0] : value;
                label = `${locale === 'ar' ? 'الحالة' : 'Status'}: ${statusLabels[statusValue] || statusValue}`;
              } else if (key === 'gender') {
                const genderLabels: Record<string, string> = {
                  male: locale === 'ar' ? 'ذكر' : 'Male',
                  female: locale === 'ar' ? 'أنثى' : 'Female',
                };
                label = `${locale === 'ar' ? 'الجنس' : 'Gender'}: ${genderLabels[value as string] || value}`;
              } else if (key === 'hasSpecialNeeds') {
                label = value ? locale === 'ar' ? 'احتياجات خاصة' : 'Special needs' : '';
              } else if (key === 'group') {
                label = `${locale === 'ar' ? 'المجموعة' : 'Group'}: ${value}`;
              } else if (key === 'hall') {
                label = `${locale === 'ar' ? 'القاعة' : 'Hall'}: ${value}`;
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