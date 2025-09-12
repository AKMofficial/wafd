'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';
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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span>الرمز</span>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>اسم القاعة</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>الجنس</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>السعة الكلية</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Bed className="h-4 w-4" />
                <span>متاح</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span>مشغول</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Accessibility className="h-4 w-4" />
                <span>احتياجات خاصة</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>نسبة الإشغال</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Activity className="h-4 w-4" />
                <span>الحالة</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Settings2 className="h-4 w-4" />
                <span>الإجراءات</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {halls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                لا توجد قاعات
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
                      {hall.type === 'male' ? 'رجال' : 'نساء'}
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
                        ممتلئة
                      </Badge>
                    ) : occupancyRate >= 90 ? (
                      <Badge variant="warning" className="text-xs">
                        شبه ممتلئة
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-xs">
                        متاحة
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
                        عرض
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
  );
}