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
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    if (!date) return '-';
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={cn(isRTL && "text-right")}>
                {locale === 'ar' ? 'رقم التسجيل' : 'Registration No.'}
              </TableHead>
              <TableHead className={cn(isRTL && "text-right")}>
                {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </TableHead>
              <TableHead className={cn(isRTL && "text-right")}>
                {locale === 'ar' ? 'الجنسية' : 'Nationality'}
              </TableHead>
              <TableHead className={cn(isRTL && "text-right")}>
                {locale === 'ar' ? 'المجموعة' : 'Group'}
              </TableHead>
              <TableHead className={cn(isRTL && "text-right")}>
                {locale === 'ar' ? 'السرير' : 'Bed'}
              </TableHead>
              <TableHead className={cn(isRTL && "text-right")}>
                {locale === 'ar' ? 'الحالة' : 'Status'}
              </TableHead>
              <TableHead className={cn(isRTL && "text-right")}>
                {locale === 'ar' ? 'تاريخ الوصول' : 'Arrival Date'}
              </TableHead>
              <TableHead className={cn(isRTL && "text-right", "w-[100px]")}>
                {locale === 'ar' ? 'الإجراءات' : 'Actions'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pilgrims.map((pilgrim) => (
              <TableRow key={pilgrim.id}>
                <TableCell className="font-medium">{pilgrim.registrationNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{pilgrim.fullName}</span>
                    {pilgrim.hasSpecialNeeds && (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{pilgrim.nationality}</TableCell>
                <TableCell>{pilgrim.groupName || '-'}</TableCell>
                <TableCell>
                  {pilgrim.assignedBed ? (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span>{pilgrim.assignedBed}</span>
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn("gap-1", statusConfig[pilgrim.status].color)}
                  >
                    {statusConfig[pilgrim.status].icon && (() => {
                      const IconComponent = statusConfig[pilgrim.status].icon;
                      return <IconComponent className="h-3 w-3" />;
                    })()}
                    {getStatusLabel(pilgrim.status)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(pilgrim.arrivalDate)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView?.(pilgrim)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(pilgrim)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {pilgrim.status === 'expected' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMarkArrival?.(pilgrim)}
                        className="h-8 w-8 text-green-600 hover:text-green-700"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden space-y-4">
        {pilgrims.map((pilgrim) => {
          const isExpanded = expandedRows.has(pilgrim.id);
          return (
            <div
              key={pilgrim.id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleRow(pilgrim.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      {pilgrim.fullName}
                      {pilgrim.hasSpecialNeeds && (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{pilgrim.registrationNumber}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("gap-1", statusConfig[pilgrim.status].color)}
                  >
                    {statusConfig[pilgrim.status].icon && (() => {
                      const IconComponent = statusConfig[pilgrim.status].icon;
                      return <IconComponent className="h-3 w-3" />;
                    })()}
                    {getStatusLabel(pilgrim.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="h-3 w-3" />
                    <span>{pilgrim.groupName || '-'}</span>
                  </div>
                  {pilgrim.assignedBed && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{pilgrim.assignedBed}</span>
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-gray-50 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">
                        {locale === 'ar' ? 'الجنسية:' : 'Nationality:'}
                      </span>
                      <span className="ms-1 font-medium">{pilgrim.nationality}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {locale === 'ar' ? 'العمر:' : 'Age:'}
                      </span>
                      <span className="ms-1 font-medium">{pilgrim.age}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {locale === 'ar' ? 'الهاتف:' : 'Phone:'}
                      </span>
                      <span className="ms-1 font-medium">{pilgrim.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {locale === 'ar' ? 'تاريخ الوصول:' : 'Arrival:'}
                      </span>
                      <span className="ms-1 font-medium">{formatDate(pilgrim.arrivalDate)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView?.(pilgrim)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 me-1" />
                      {locale === 'ar' ? 'عرض' : 'View'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(pilgrim)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 me-1" />
                      {locale === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                    {pilgrim.status === 'expected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkArrival?.(pilgrim)}
                        className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <UserCheck className="h-4 w-4 me-1" />
                        {locale === 'ar' ? 'تسجيل وصول' : 'Mark Arrival'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}