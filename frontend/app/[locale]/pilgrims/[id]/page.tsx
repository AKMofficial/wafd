'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { useHallStore } from '@/store/hall-store';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit, 
  Trash,
  Phone,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  Accessibility,
  UserCheck,
  Clock,
  Building,
  Bed
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PilgrimStatus } from '@/types/pilgrim';
import { formatDateAsHijri } from '@/lib/hijri-date';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusConfig: Record<PilgrimStatus, { color: string; icon?: any }> = {
  expected: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  arrived: { color: 'bg-green-100 text-green-800 border-green-200', icon: UserCheck },
  departed: { color: 'bg-gray-100 text-gray-800 border-gray-200' },
  no_show: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
};

export default function PilgrimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { canEdit, canDelete } = useAuth();

  const { selectedPilgrim, fetchPilgrimById, isLoading, markArrival, deletePilgrim } = usePilgrimStore();
  const [isMarkingArrival, setIsMarkingArrival] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }
    }
    if (params.id) {
      fetchPilgrimById(params.id as string);
    }
  }, [params.id, router, locale]);

  const handleBack = () => {
    router.push(`/${locale}/pilgrims`);
  };

  const handleEdit = () => {
    router.push(`/${locale}/pilgrims/${params.id}/edit`);
  };

  const handleMarkArrival = async () => {
    if (!selectedPilgrim) return;
    
    setIsMarkingArrival(true);
    try {
      await markArrival(selectedPilgrim.id, new Date());
      await fetchPilgrimById(selectedPilgrim.id);
    } catch (error) {
      console.error('Failed to mark arrival:', error);
    }
    setIsMarkingArrival(false);
  };

  const handleDelete = async () => {
    if (!selectedPilgrim) return;
    
    setIsDeleting(true);
    try {
      const success = await deletePilgrim(selectedPilgrim.id);
      if (success) {
        router.push(`/${locale}/pilgrims`);
      } else {
        alert(t('pilgrims.detail.errorDeleting'));
      }
    } catch (error) {
      console.error('Failed to delete pilgrim:', error);
      alert(t('pilgrims.detail.errorDeleting'));
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  const formatDate = (date?: Date) => {
    return formatDateAsHijri(date, locale);
  };

  const getStatusLabel = (status: PilgrimStatus) => {
    return t(`pilgrims.status.${status === 'no_show' ? 'noShow' : status}` as any);
  };

  const getDisabilityLabel = (type: string) => {
    return t(`pilgrims.form.disabilityTypes.${type}` as any) || type;
  };

  if (isLoading) {
    return (
      <main className="p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (!selectedPilgrim) {
    return (
      <main className="p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">
              {t('pilgrims.pages.notFound')}
            </h2>
            <Button onClick={handleBack}>
              {isRTL ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}
              {t('pilgrims.pages.backToList')}
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            {isRTL ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}
            {t('pilgrims.detail.back')}
          </Button>
          
        </div>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{selectedPilgrim.fullName}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{selectedPilgrim.registrationNumber}</span>
                  <span>•</span>
                  <span>{selectedPilgrim.nationality}</span>
                  {selectedPilgrim.groupName && (
                    <>
                      <span>•</span>
                      <span>{selectedPilgrim.groupName}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("gap-1", statusConfig[selectedPilgrim.status].color)}
                >
                  {statusConfig[selectedPilgrim.status].icon && (() => {
                    const Icon = statusConfig[selectedPilgrim.status].icon;
                    return <Icon className="h-3 w-3" />;
                  })()}
                  {getStatusLabel(selectedPilgrim.status)}
                </Badge>
                
                {selectedPilgrim.hasSpecialNeeds && (
                  <Badge variant="outline" className="gap-1 text-purple-600 border-purple-200">
                    <Accessibility className="h-3 w-3" />
                    {t('pilgrims.detail.specialNeeds')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">
                  {t('pilgrims.detail.basicInfo')}
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.nationalId')}
                    </span>
                    <span className="font-medium font-mono">{selectedPilgrim.nationalId}</span>
                  </div>

                  {selectedPilgrim.passportNumber && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">
                        {t('pilgrims.detail.passportNumber')}
                      </span>
                      <span className="font-medium font-mono">{selectedPilgrim.passportNumber}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.nationality')}
                    </span>
                    <span className="font-medium">{selectedPilgrim.nationality}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.phoneNumber')}
                    </span>
                    <a href={`tel:${selectedPilgrim.phoneNumber}`} className="font-medium text-primary hover:underline">
                      {selectedPilgrim.phoneNumber}
                    </a>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.group')}
                    </span>
                    <span className="font-medium">{selectedPilgrim.groupName || '-'}</span>
                  </div>

                  {selectedPilgrim.hasSpecialNeeds && selectedPilgrim.specialNeedsType && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">
                        {t('pilgrims.detail.disabilityType')}
                      </span>
                      <span className="font-medium">
                        {getDisabilityLabel(selectedPilgrim.specialNeedsType)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">
                  {t('pilgrims.detail.personalInfo')}
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.firstName')}
                    </span>
                    <span className="font-medium">{selectedPilgrim.firstName}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.lastName')}
                    </span>
                    <span className="font-medium">{selectedPilgrim.lastName}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.age')}
                    </span>
                    <span className="font-medium">{selectedPilgrim.age} {t('pilgrims.detail.years')}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.gender')}
                    </span>
                    <span className="font-medium">
                      {t(`pilgrims.detail.${selectedPilgrim.gender}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">
                {t('pilgrims.detail.accommodationInfo')}
              </h3>

              <div className="space-y-3">
                {selectedPilgrim.assignedHall && selectedPilgrim.assignedBed ? (
                  <Card className="p-4 bg-gray-50 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            {t('pilgrims.detail.hall')}
                          </p>
                          <p className="font-medium">{selectedPilgrim.assignedHall}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Bed className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            {t('pilgrims.detail.bedNumber')}
                          </p>
                          <p className="font-medium">{selectedPilgrim.assignedBed}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => {
                        router.push(`/${locale}/halls`);
                      }}
                    >
                      {t('pilgrims.detail.viewHallDetails')}
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">
                          {t('pilgrims.detail.noBedAssigned')}
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          {t('pilgrims.detail.bedAssignmentNote')}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {selectedPilgrim.arrivalDate && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.arrivalDate')}
                    </span>
                    <span className="font-medium">{formatDate(selectedPilgrim.arrivalDate)}</span>
                  </div>
                )}

                {selectedPilgrim.departureDate && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {t('pilgrims.detail.departureDate')}
                    </span>
                    <span className="font-medium">{formatDate(selectedPilgrim.departureDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedPilgrim.notes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">
                  {t('pilgrims.detail.additionalInfo')}
                </h3>
                <Card className="p-4 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start py-2">
                      <span className="text-gray-600 font-medium">
                        {t('pilgrims.detail.notes')}
                      </span>
                    </div>
                    <p className="text-gray-700">{selectedPilgrim.notes}</p>
                  </div>
                </Card>
              </div>
            )}
          </div>

          <div className="border-t p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {selectedPilgrim.status === 'expected' && (
                <Button
                  onClick={handleMarkArrival}
                  disabled={isMarkingArrival}
                  className="flex-1 sm:flex-none"
                >
                  <UserCheck className="h-4 w-4 me-2" />
                  {t('pilgrims.detail.markArrival')}
                </Button>
              )}

              {canEdit() && (
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex-1 sm:flex-none"
                >
                  <Edit className="h-4 w-4 me-2" />
                  {t('pilgrims.detail.edit')}
                </Button>
              )}

              {canDelete() && (
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash className="h-4 w-4 me-2" />
                  {t('pilgrims.detail.delete')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('pilgrims.detail.confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('pilgrims.detail.deleteWarning').replace('{name}', selectedPilgrim?.fullName || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}