'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from '@/lib/i18n';
import { Hall } from '@/types/hall';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye,
  Hash,
  Building2,
  UserPlus,
  Users,
  Bed,
  UserCheck,
  Accessibility,
  TrendingUp,
  Activity,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HallsTableProps {
  halls: Hall[];
}

export function HallsTable({ halls }: HallsTableProps) {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations();
  
  const handleViewDetails = (hallId: string) => {
    router.push(`/${locale}/halls/${hallId}`);
  };
  
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <span>{t('halls.table.code')}</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{t('halls.table.hallName')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>{t('halls.table.gender')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{t('halls.table.totalCapacity')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Bed className="h-4 w-4" />
                    <span>{t('halls.table.available')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>{t('halls.table.occupied')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Accessibility className="h-4 w-4" />
                    <span>{t('halls.table.specialNeeds')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{t('halls.table.occupancyRate')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>{t('halls.table.status')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    <span>{t('halls.table.actions')}</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {halls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                    {t('halls.table.noHalls')}
                  </TableCell>
                </TableRow>
              ) : (
                halls.map((hall) => {
                  const occupancyRate = hall.capacity > 0
                    ? (hall.currentOccupancy / hall.capacity) * 100
                    : 0;

                  return (
                    <TableRow
                      key={hall.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetails(hall.id)}
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs px-2 py-0.5",
                            hall.type === 'male'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-pink-50 text-pink-700 border-pink-200'
                          )}
                        >
                          {hall.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{hall.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            hall.type === 'male'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-pink-50 text-pink-700 border-pink-200'
                          )}
                        >
                          {t(`halls.hallType.${hall.type}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{hall.capacity}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">
                          {hall.availableBeds}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-orange-600 font-medium">
                          {hall.currentOccupancy}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-purple-600 font-medium">
                          {hall.specialNeedsOccupancy || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all", getProgressColor(occupancyRate))}
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                          <span className={cn("text-sm font-medium", getOccupancyColor(occupancyRate))}>
                            {occupancyRate.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {occupancyRate >= 100 ? (
                          <Badge variant="error" className="text-xs">
                            {t('halls.table.full')}
                          </Badge>
                        ) : occupancyRate >= 90 ? (
                          <Badge variant="warning" className="text-xs">
                            {t('halls.table.nearlyFull')}
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-xs">
                            {t('halls.table.availableStatus')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(hall.id)}
                          >
                            <Eye className={cn("h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
                            {t('halls.table.view')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="rounded-lg border overflow-x-auto">
          <Table className="min-w-[400px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs px-2 py-2">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{t('table.code')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-xs px-2 py-2">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{t('table.hallName')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center text-xs px-2 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{t('halls.occupancy')}</span>
                  </div>
                </TableHead>
                <TableHead className="text-center text-xs px-2 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{t('table.view')}</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {halls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8 text-xs">
                    {t('halls.table.noHalls')}
                  </TableCell>
                </TableRow>
              ) : (
                halls.map((hall) => {
                  const occupancyRate = hall.capacity > 0
                    ? (hall.currentOccupancy / hall.capacity) * 100
                    : 0;

                  return (
                    <TableRow
                      key={hall.id}
                      className="hover:bg-gray-50"
                      onClick={() => handleViewDetails(hall.id)}
                    >
                      <TableCell className="text-xs px-2 py-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 whitespace-nowrap",
                            hall.type === 'male'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-pink-50 text-pink-700 border-pink-200'
                          )}
                        >
                          {hall.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs px-2 py-2 min-w-[120px]">
                        <span className="truncate max-w-[150px] block">{hall.name}</span>
                      </TableCell>
                      <TableCell className="text-center px-2 py-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn("text-xs font-medium", getOccupancyColor(occupancyRate))}>
                            {occupancyRate.toFixed(0)}%
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {hall.currentOccupancy}/{hall.capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center px-2 py-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleViewDetails(hall.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}