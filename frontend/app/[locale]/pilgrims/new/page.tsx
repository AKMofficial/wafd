'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { PilgrimForm } from '@/components/pilgrims/pilgrim-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CreatePilgrimDto, UpdatePilgrimDto } from '@/types/pilgrim';

export default function NewPilgrimPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPilgrim } = usePilgrimStore();

  const handleSubmit = async (data: CreatePilgrimDto | UpdatePilgrimDto) => {
    setIsSubmitting(true);
    try {
      const newPilgrim = await createPilgrim(data as CreatePilgrimDto);
      router.push(`/${locale}/pilgrims/${newPilgrim.id}`);
    } catch (error) {
      console.error('Failed to create pilgrim:', error);
      alert(t('pilgrims.pages.errorAdding'));
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    router.push(`/${locale}/pilgrims`);
  };

  return (
    <main className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={handleCancel} className="mb-4">
              {isRTL ? <ArrowRight className="h-4 w-4 me-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}
              {t('pilgrims.pages.new.back')}
            </Button>
            <h1 className="text-2xl font-bold">
              {t('pilgrims.pages.new.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('pilgrims.pages.new.subtitle')}
            </p>
          </div>
        </div>

        <PilgrimForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </main>
  );
}