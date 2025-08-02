'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';
import { Bed } from '@/types/hall';
import { Pilgrim } from '@/types/pilgrim';
import { usePilgrimStore } from '@/store/pilgrim-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  AlertCircle,
  Bed as BedIcon,
  Clock,
  Wrench,
  Lock,
  UserX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BedDetailsDialogProps {
  bed: Bed | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignPilgrim?: (bedId: string) => void;
  onVacateBed?: (bedId: string) => void;
  onChangeBedStatus?: (bedId: string, status: Bed['status']) => void;
}

export function BedDetailsDialog({
  bed,
  isOpen,
  onClose,
  onAssignPilgrim,
  onVacateBed,
  onChangeBedStatus,
}: BedDetailsDialogProps) {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [pilgrim, setPilgrim] = useState<Pilgrim | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { fetchPilgrimById } = usePilgrimStore();
  
  useEffect(() => {
    if (bed?.pilgrimId && bed.status === 'occupied') {
      setIsLoading(true);
      fetchPilgrimById(bed.pilgrimId).then((p) => {
        setPilgrim(p);
        setIsLoading(false);
      });
    } else {
      setPilgrim(null);
    }
  }, [bed, fetchPilgrimById]);
  
  if (!bed) return null;
  
  const getStatusConfig = () => {
    switch (bed.status) {
      case 'vacant':
        return {
          icon: BedIcon,
          color: 'text-green-600 bg-green-100',
          title: locale === 'ar' ? 'سرير شاغر' : 'Vacant Bed',
          description: locale === 'ar' 
            ? 'هذا السرير متاح للتخصيص' 
            : 'This bed is available for assignment',
        };
      case 'occupied':
        return {
          icon: User,
          color: 'text-red-600 bg-red-100',
          title: locale === 'ar' ? 'سرير مشغول' : 'Occupied Bed',
          description: locale === 'ar' 
            ? 'هذا السرير مخصص لحاج' 
            : 'This bed is assigned to a pilgrim',
        };
      case 'reserved':
        return {
          icon: Lock,
          color: 'text-yellow-600 bg-yellow-100',
          title: locale === 'ar' ? 'سرير محجوز' : 'Reserved Bed',
          description: locale === 'ar' 
            ? 'هذا السرير محجوز وغير متاح حالياً' 
            : 'This bed is reserved and not available',
        };
      case 'maintenance':
        return {
          icon: Wrench,
          color: 'text-gray-600 bg-gray-100',
          title: locale === 'ar' ? 'سرير تحت الصيانة' : 'Bed Under Maintenance',
          description: locale === 'ar' 
            ? 'هذا السرير تحت الصيانة وغير متاح' 
            : 'This bed is under maintenance and not available',
        };
    }
  };
  
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", statusConfig.color.split(' ')[0])} />
            {locale === 'ar' ? 'تفاصيل السرير' : 'Bed Details'} - {bed.number}
          </DialogTitle>
          <DialogDescription>
            {statusConfig.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Bed Information */}
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">
              {locale === 'ar' ? 'معلومات السرير' : 'Bed Information'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'ar' ? 'رقم السرير' : 'Bed Number'}
                </span>
                <span className="font-medium">{bed.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'ar' ? 'رمز القاعة' : 'Hall Code'}
                </span>
                <span className="font-medium">{bed.hallCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </span>
                <Badge className={cn("gap-1", statusConfig.color)}>
                  {statusConfig.title}
                </Badge>
              </div>
              {bed.isSpecialNeeds && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {locale === 'ar' ? 'احتياجات خاصة' : 'Special Needs'}
                  </span>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    {locale === 'ar' ? 'نعم' : 'Yes'}
                  </Badge>
                </div>
              )}
            </div>
          </Card>
          
          {/* Pilgrim Information (if occupied) */}
          {bed.status === 'occupied' && pilgrim && !isLoading && (
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">
                {locale === 'ar' ? 'معلومات الحاج' : 'Pilgrim Information'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {locale === 'ar' ? 'الاسم' : 'Name'}
                  </span>
                  <span className="font-medium">{pilgrim.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {locale === 'ar' ? 'رقم التسجيل' : 'Registration No.'}
                  </span>
                  <span className="font-medium">{pilgrim.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {locale === 'ar' ? 'الجنسية' : 'Nationality'}
                  </span>
                  <span className="font-medium">{pilgrim.nationality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {locale === 'ar' ? 'رقم الهاتف' : 'Phone'}
                  </span>
                  <span className="font-medium" dir="ltr">{pilgrim.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {locale === 'ar' ? 'تاريخ الوصول' : 'Arrival Date'}
                  </span>
                  <span className="text-xs">{formatDate(pilgrim.arrivalDate)}</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => {
                  router.push(`/${locale}/pilgrims/${pilgrim.id}`);
                  onClose();
                }}
              >
                {locale === 'ar' ? 'عرض تفاصيل الحاج' : 'View Pilgrim Details'}
              </Button>
            </Card>
          )}
          
          {/* Maintenance Notes */}
          {bed.status === 'maintenance' && bed.maintenanceNotes && (
            <Card className="p-4 space-y-2 bg-gray-50">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                {locale === 'ar' ? 'ملاحظات الصيانة' : 'Maintenance Notes'}
              </h3>
              <p className="text-sm text-gray-600">{bed.maintenanceNotes}</p>
            </Card>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {bed.status === 'vacant' && (
              <Button
                className="flex-1"
                onClick={() => {
                  onAssignPilgrim?.(bed.id);
                  onClose();
                }}
              >
                <User className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {locale === 'ar' ? 'تخصيص لحاج' : 'Assign to Pilgrim'}
              </Button>
            )}
            
            {bed.status === 'occupied' && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  if (confirm(locale === 'ar' 
                    ? 'هل أنت متأكد من إخلاء هذا السرير؟' 
                    : 'Are you sure you want to vacate this bed?'
                  )) {
                    onVacateBed?.(bed.id);
                    onClose();
                  }
                }}
              >
                <UserX className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {locale === 'ar' ? 'إخلاء السرير' : 'Vacate Bed'}
              </Button>
            )}
            
            {(bed.status === 'vacant' || bed.status === 'reserved') && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onChangeBedStatus?.(bed.id, 'maintenance');
                  onClose();
                }}
              >
                <Wrench className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {locale === 'ar' ? 'وضع تحت الصيانة' : 'Set to Maintenance'}
              </Button>
            )}
            
            {bed.status === 'maintenance' && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onChangeBedStatus?.(bed.id, 'vacant');
                  onClose();
                }}
              >
                <BedIcon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {locale === 'ar' ? 'إنهاء الصيانة' : 'End Maintenance'}
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              {locale === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}