'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { PilgrimForm } from '@/components/pilgrims/pilgrim-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { UpdatePilgrimDto } from '@/types/pilgrim';

export default function EditPilgrimPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { selectedPilgrim, fetchPilgrimById, updatePilgrim, isLoading } = usePilgrimStore();

  useEffect(() => {
    if (params.id) {
      fetchPilgrimById(params.id as string);
    }
  }, [params.id]);

  const handleSubmit = async (data: UpdatePilgrimDto) => {
    if (!selectedPilgrim) return;

    setIsSubmitting(true);
    try {
      await updatePilgrim(selectedPilgrim.id, data);
      router.push(`/${locale}/pilgrims/${selectedPilgrim.id}`);
    } catch (error) {
      console.error('Failed to update pilgrim:', error);
      alert(t('pilgrims.pages.errorUpdating'));
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    if (selectedPilgrim) {
      router.push(`/${locale}/pilgrims/${selectedPilgrim.id}`);
    } else {
      router.push(`/${locale}/pilgrims`);
    }
  };

  if (isLoading) {
    return (
      <main className="p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </Card>
            ))}
          </div>
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
            <Button onClick={() => router.push(`/${locale}/pilgrims`)}>
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
          <div>
            <Button variant="ghost" onClick={handleCancel} className="mb-4">
              {isRTL ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}
              {t('pilgrims.pages.edit.back')}
            </Button>
            <h1 className="text-2xl font-bold">
              {t('pilgrims.pages.edit.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {selectedPilgrim.fullName} - {selectedPilgrim.registrationNumber}
            </p>
          </div>
        </div>

        <PilgrimForm
          pilgrim={selectedPilgrim}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </main>
  );
}