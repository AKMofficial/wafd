'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { useHallStore } from '@/store/hall-store';
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
  UserCheck,
  Clock,
  Printer,
  Share2,
  Building,
  Bed
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PilgrimStatus } from '@/types/pilgrim';
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
  
  const { selectedPilgrim, fetchPilgrimById, isLoading, markArrival, deletePilgrim } = usePilgrimStore();
  const [isMarkingArrival, setIsMarkingArrival] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPilgrimById(params.id as string);
    }
  }, [params.id]);

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
        alert(locale === 'ar' ? 'فشل في حذف الحاج' : 'Failed to delete pilgrim');
      }
    } catch (error) {
      console.error('Failed to delete pilgrim:', error);
      alert(locale === 'ar' ? 'فشل في حذف الحاج' : 'Failed to delete pilgrim');
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
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
              {locale === 'ar' ? 'لم يتم العثور على الحاج' : 'Pilgrim not found'}
            </h2>
            <Button onClick={handleBack}>
              {isRTL ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}
              {locale === 'ar' ? 'العودة للقائمة' : 'Back to list'}
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
            {locale === 'ar' ? 'رجوع' : 'Back'}
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
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
                  <Badge variant="outline" className="gap-1 text-orange-600 border-orange-200">
                    <AlertCircle className="h-3 w-3" />
                    {locale === 'ar' ? 'احتياجات خاصة' : 'Special Needs'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">
                  {locale === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {locale === 'ar' ? 'الاسم الأول' : 'First Name'}
                    </span>
                    <span className="font-medium">{selectedPilgrim.firstName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {locale === 'ar' ? 'الاسم الأخير' : 'Last Name'}
                    </span>
                    <span className="font-medium">{selectedPilgrim.lastName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {locale === 'ar' ? 'الجنس' : 'Gender'}
                    </span>
                    <span className="font-medium">
                      {selectedPilgrim.gender === 'male' 
                        ? (locale === 'ar' ? 'ذكر' : 'Male')
                        : (locale === 'ar' ? 'أنثى' : 'Female')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {locale === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
                    </span>
                    <span className="font-medium">{formatDate(selectedPilgrim.birthDate)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {locale === 'ar' ? 'العمر' : 'Age'}
                    </span>
                    <span className="font-medium">{selectedPilgrim.age} {locale === 'ar' ? 'سنة' : 'years'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">
                  {locale === 'ar' ? 'معلومات الهوية' : 'Identification'}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {locale === 'ar' ? 'رقم الهوية' : 'National ID'}
                    </span>
                    <span className="font-medium font-mono">{selectedPilgrim.nationalId}</span>
                  </div>
                  
                  {selectedPilgrim.passportNumber && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">
                        {locale === 'ar' ? 'رقم الجواز' : 'Passport Number'}
                      </span>
                      <span className="font-medium font-mono">{selectedPilgrim.passportNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {locale === 'ar' ? 'الجنسية' : 'Nationality'}
                    </span>
                    <span className="font-medium">{selectedPilgrim.nationality}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">
                  {locale === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">
                      {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </span>
                    <a href={`tel:${selectedPilgrim.phoneNumber}`} className="font-medium text-primary hover:underline">
                      {selectedPilgrim.phoneNumber}
                    </a>
                  </div>
                  
                  {selectedPilgrim.emergencyContact && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">
                          {locale === 'ar' ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}
                        </span>
                        <span className="font-medium">{selectedPilgrim.emergencyContact}</span>
                      </div>
                      
                      {selectedPilgrim.emergencyPhone && (
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">
                            {locale === 'ar' ? 'هاتف الطوارئ' : 'Emergency Phone'}
                          </span>
                          <a href={`tel:${selectedPilgrim.emergencyPhone}`} className="font-medium text-primary hover:underline">
                            {selectedPilgrim.emergencyPhone}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">
                  {locale === 'ar' ? 'معلومات الإقامة' : 'Accommodation'}
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
                              {locale === 'ar' ? 'القاعة' : 'Hall'}
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
                              {locale === 'ar' ? 'رقم السرير' : 'Bed Number'}
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
                          // Navigate to hall detail page - will be implemented with hall ID lookup
                          router.push(`/${locale}/halls`);
                        }}
                      >
                        {locale === 'ar' ? 'عرض تفاصيل القاعة' : 'View Hall Details'}
                      </Button>
                    </Card>
                  ) : (
                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">
                            {locale === 'ar' ? 'لم يتم تخصيص سرير' : 'No bed assigned'}
                          </p>
                          <p className="text-sm text-yellow-700 mt-1">
                            {locale === 'ar' 
                              ? 'يجب تخصيص سرير لهذا الحاج عند الوصول' 
                              : 'A bed should be assigned when the pilgrim arrives'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  {selectedPilgrim.arrivalDate && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">
                        {locale === 'ar' ? 'تاريخ الوصول' : 'Arrival Date'}
                      </span>
                      <span className="font-medium">{formatDate(selectedPilgrim.arrivalDate)}</span>
                    </div>
                  )}
                  
                  {selectedPilgrim.departureDate && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">
                        {locale === 'ar' ? 'تاريخ المغادرة' : 'Departure Date'}
                      </span>
                      <span className="font-medium">{formatDate(selectedPilgrim.departureDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedPilgrim.hasSpecialNeeds && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">
                  {locale === 'ar' ? 'الاحتياجات الخاصة' : 'Special Needs'}
                </h3>
                
                <Card className="p-4 bg-orange-50 border-orange-200">
                  {selectedPilgrim.specialNeedsType && (
                    <div className="mb-2">
                      <span className="text-gray-600">
                        {locale === 'ar' ? 'النوع: ' : 'Type: '}
                      </span>
                      <span className="font-medium">
                        {selectedPilgrim.specialNeedsType}
                      </span>
                    </div>
                  )}
                  {selectedPilgrim.specialNeedsNotes && (
                    <p className="text-gray-700">{selectedPilgrim.specialNeedsNotes}</p>
                  )}
                </Card>
              </div>
            )}

            {selectedPilgrim.notes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">
                  {locale === 'ar' ? 'ملاحظات' : 'Notes'}
                </h3>
                <Card className="p-4 bg-gray-50">
                  <p className="text-gray-700">{selectedPilgrim.notes}</p>
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
                  {locale === 'ar' ? 'تسجيل وصول' : 'Mark Arrival'}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleEdit}
                className="flex-1 sm:flex-none"
              >
                <Edit className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'حذف' : 'Delete'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'ar' 
                ? `هل أنت متأكد من حذف بيانات الحاج ${selectedPilgrim.fullName}؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete ${selectedPilgrim.fullName}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {locale === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}