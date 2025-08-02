'use client';

import { useTranslations, useLocale } from '@/lib/i18n';

export default function PilgrimsPage() {
  const t = useTranslations();
  const locale = useLocale();
  
  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('nav.pilgrims')}
          </h1>
          <p className="text-gray-600">
            {t('app.description')}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center py-8">
            {t('common.loading')}...
          </p>
        </div>
      </div>
    </main>
  );
}