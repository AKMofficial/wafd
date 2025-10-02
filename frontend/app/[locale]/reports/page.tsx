'use client';

import { useTranslations, useLocale } from '@/lib/i18n';

export default function ReportsPage() {
  const t = useTranslations();
  const locale = useLocale();
  
  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('nav.reports')}
          </h1>
          <p className="text-gray-600">
            {t('reports.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">{t('reports.occupancyReport.title')}</h3>
            <p className="text-gray-600 text-sm">{t('reports.occupancyReport.description')}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">{t('reports.vacancyReport.title')}</h3>
            <p className="text-gray-600 text-sm">{t('reports.vacancyReport.description')}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">{t('reports.attendanceReport.title')}</h3>
            <p className="text-gray-600 text-sm">{t('reports.attendanceReport.description')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}