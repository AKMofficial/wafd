'use client';

import { useTranslations, useLocale } from '@/lib/i18n';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  
  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('app.title')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('app.welcome')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">إجمالي الحجاج</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">الأسرّة المشغولة</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">الأسرّة الشاغرة</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">نسبة الإشغال</h3>
            <p className="text-3xl font-bold text-orange-600">0%</p>
          </div>
        </div>
      </div>
    </main>
  )
}