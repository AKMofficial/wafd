'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
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
import { formatDateAsHijri } from '@/lib/hijri-date';

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
  const t = useTranslations();
  const isRTL = locale === 'ar';
  const { canSetMaintenance } = useAuth();
  const [pilgrim, setPilgrim] = useState<Pilgrim | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchPilgrimById } = usePilgrimStore();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

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
          title: t('halls.bedDetailsDialog.vacantBed'),
          description: t('halls.bedDetailsDialog.availableForAssignment'),
        };
      case 'occupied':
        return {
          icon: User,
          color: 'text-red-600 bg-red-100',
          title: t('halls.bedDetailsDialog.occupiedBed'),
          description: t('halls.bedDetailsDialog.assignedToPilgrim'),
        };
      case 'reserved':
        return {
          icon: Lock,
          color: 'text-yellow-600 bg-yellow-100',
          title: t('halls.bedDetailsDialog.reservedBed'),
          description: t('halls.bedDetailsDialog.reservedNotAvailable'),
        };
      case 'maintenance':
        return {
          icon: Wrench,
          color: 'text-gray-600 bg-gray-100',
          title: t('halls.bedDetailsDialog.maintenanceBed'),
          description: t('halls.bedDetailsDialog.underMaintenance'),
        };
    }
  };
  
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  
  const formatDate = (date?: Date) => {
    return formatDateAsHijri(date, locale, true);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", statusConfig.color.split(' ')[0])} />
            {t('halls.bedDetailsDialog.bedNumber')} - {bed.number}
          </DialogTitle>
          <DialogDescription>
            {statusConfig.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Bed Information */}
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">
              {t('halls.bedDetailsDialog.bedNumber')}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t('halls.bedDetailsDialog.bedNumber')}
                </span>
                <span className="font-medium">{bed.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t('halls.createDialog.hallCode')}
                </span>
                <span className="font-medium">{bed.hallCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t('halls.bedStatusLabel')}
                </span>
                <Badge className={cn("gap-1", statusConfig.color)}>
                  {statusConfig.title}
                </Badge>
              </div>
              {bed.isSpecialNeeds && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t('halls.specialNeeds')}
                  </span>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    {t('pilgrims.filters.yes')}
                  </Badge>
                </div>
              )}
            </div>
          </Card>
          
          {/* Pilgrim Information (if occupied) */}
          {bed.status === 'occupied' && (
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">
                {t('halls.bedDetailsDialog.pilgrimInfo')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t('halls.bedDetailsDialog.name')}
                  </span>
                  <span className="font-medium">
                    {bed.pilgrimName || (pilgrim?.fullName) || 'Unknown'}
                  </span>
                </div>
                {pilgrim && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t('halls.bedDetailsDialog.registrationNumber')}
                      </span>
                      <span className="font-medium">{pilgrim.registrationNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t('pilgrims.detail.nationality')}
                      </span>
                      <span className="font-medium">{pilgrim.nationality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t('halls.bedDetailsDialog.phone')}
                      </span>
                      <span className="font-medium" dir="ltr">{pilgrim.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t('halls.bedDetailsDialog.arrivalDate')}
                      </span>
                      <span className="text-xs">{formatDate(pilgrim.arrivalDate)}</span>
                    </div>
                  </>
                )}
              </div>

              {pilgrim && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    router.push(`/${locale}/pilgrims/${pilgrim.id}`);
                    onClose();
                  }}
                >
                  {t('halls.bedDetailsDialog.viewPilgrimDetails')}
                </Button>
              )}
            </Card>
          )}

          {/* No Pilgrim Information */}
          {bed.status !== 'occupied' && (
            <Card className="p-4 space-y-3 bg-gray-50">
              <h3 className="font-semibold text-sm">
                {t('halls.bedDetailsDialog.pilgrimInfo')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {t('halls.bedDetailsDialog.name')}
                  </span>
                  <span className="font-medium text-gray-400">
                    None
                  </span>
                </div>
              </div>
            </Card>
          )}
          
          {/* Maintenance Notes */}
          {bed.status === 'maintenance' && bed.maintenanceNotes && (
            <Card className="p-4 space-y-2 bg-gray-50">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                {t('halls.bedDetailsDialog.maintenanceNotes')}
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
                {t('halls.bedDetailsDialog.assignPilgrim')}
              </Button>
            )}

            {bed.status === 'occupied' && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  if (confirm(t('halls.bedDetailsDialog.confirmVacate'))) {
                    onVacateBed?.(bed.id);
                    onClose();
                  }
                }}
              >
                <UserX className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t('halls.bedDetailsDialog.vacateBed')}
              </Button>
            )}

            {canSetMaintenance() && (bed.status === 'vacant' || bed.status === 'reserved') && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onChangeBedStatus?.(bed.id, 'maintenance');
                  onClose();
                }}
              >
                <Wrench className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t('halls.bedDetailsDialog.markForMaintenance')}
              </Button>
            )}

            {canSetMaintenance() && bed.status === 'maintenance' && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onChangeBedStatus?.(bed.id, 'vacant');
                  onClose();
                }}
              >
                <BedIcon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t('halls.bedDetailsDialog.markAsVacant')}
              </Button>
            )}

            <Button variant="outline" onClick={onClose}>
              {t('halls.bedDetailsDialog.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}