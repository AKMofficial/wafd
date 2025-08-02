'use client';

import { useTranslations, useLocale } from '@/lib/i18n';

export default function HallsPage() {
  const t = useTranslations();
  const locale = useLocale();
  
  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('nav.halls')}
          </h1>
          <p className="text-gray-600">
            {t('app.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">قسم الرجال</h2>
            <p className="text-gray-500 text-center py-8">
              لا توجد قاعات حالياً
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">قسم النساء</h2>
            <p className="text-gray-500 text-center py-8">
              لا توجد قاعات حالياً
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}