'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from '@/lib/i18n';
import { Pilgrim, PilgrimStatus } from '@/types/pilgrim';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash,
  UserCheck,
  Phone,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  Accessibility,
  Hash,
  User,
  Flag,
  Home,
  Activity,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateAsHijri } from '@/lib/hijri-date';

interface PilgrimsTableProps {
  pilgrims: Pilgrim[];
  isLoading?: boolean;
  onView?: (pilgrim: Pilgrim) => void;
  onEdit?: (pilgrim: Pilgrim) => void;
  onDelete?: (pilgrim: Pilgrim) => void;
  onMarkArrival?: (pilgrim: Pilgrim) => void;
}

const statusConfig: Record<PilgrimStatus, { color: string; icon?: any }> = {
  expected: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  arrived: { color: 'bg-green-100 text-green-800 border-green-200', icon: UserCheck },
  departed: { color: 'bg-gray-100 text-gray-800 border-gray-200' },
  no_show: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
};

export function PilgrimsTable({
  pilgrims,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onMarkArrival,
}: PilgrimsTableProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (date?: Date) => {
    return formatDateAsHijri(date, locale);
  };

  const getStatusLabel = (status: PilgrimStatus) => {
    const labels = {
      expected: locale === 'ar' ? 'متوقع' : 'Expected',
      arrived: locale === 'ar' ? 'وصل' : 'Arrived',
      departed: locale === 'ar' ? 'غادر' : 'Departed',
      no_show: locale === 'ar' ? 'لم يحضر' : 'No Show',
    };
    return labels[status];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="hidden lg:block">
        <div className="rounded-lg border">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <span>رقم التسجيل</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>الاسم الكامل</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Flag className="h-4 w-4" />
                  <span>الجنسية</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>المجموعة</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>القاعة</span>
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
            {pilgrims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  لا يوجد حجاج
                </TableCell>
              </TableRow>
            ) : (
              pilgrims.map((pilgrim) => (
                <TableRow 
                  key={pilgrim.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onView?.(pilgrim)}
                >
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-200"
                    >
                      {pilgrim.registrationNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{pilgrim.fullName}</span>
                      {pilgrim.hasSpecialNeeds && (
                        <Accessibility className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{pilgrim.nationality}</TableCell>
                  <TableCell className="text-center">{pilgrim.groupName || '-'}</TableCell>
                  <TableCell className="text-center">{pilgrim.assignedHall || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", statusConfig[pilgrim.status].color)}
                    >
                      {statusConfig[pilgrim.status].icon && (() => {
                        const IconComponent = statusConfig[pilgrim.status].icon;
                        return <IconComponent className="h-3 w-3" />;
                      })()}
                      {getStatusLabel(pilgrim.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onView?.(pilgrim)}
                      >
                        <Eye className={cn("h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
                        عرض
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span>رقم التسجيل</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>الاسم</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>الحالة</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>عرض</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pilgrims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    لا يوجد حجاج
                  </TableCell>
                </TableRow>
              ) : (
                pilgrims.map((pilgrim) => (
                  <TableRow 
                    key={pilgrim.id}
                    className="hover:bg-gray-50"
                    onClick={() => onView?.(pilgrim)}
                  >
                    <TableCell className="text-xs">{pilgrim.registrationNumber}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <span>{pilgrim.fullName}</span>
                        {pilgrim.hasSpecialNeeds && (
                          <Accessibility className="h-3 w-3 text-purple-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", statusConfig[pilgrim.status].color)}
                      >
                        {getStatusLabel(pilgrim.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onView?.(pilgrim)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}