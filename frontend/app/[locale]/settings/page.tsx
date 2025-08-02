'use client';

import { useTranslations, useLocale } from '@/lib/i18n';

export default function SettingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  
  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('nav.settings')}
          </h1>
          <p className="text-gray-600">
            {t('app.description')}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">إعدادات عامة</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المؤسسة
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="أدخل اسم المؤسسة"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الترخيص
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="أدخل رقم الترخيص"
              />
            </div>
            
            <div className="pt-4">
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}