'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from '@/lib/i18n';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { useHallStore } from '@/store/hall-store';
import { StatisticsCards } from '@/components/dashboard/statistics-cards';
import { Charts } from '@/components/dashboard/charts';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const [isMounted, setIsMounted] = useState(false);
  
  const { getStatistics: getPilgrimStats, fetchPilgrims } = usePilgrimStore();
  const { getStatistics: getHallStats, fetchHalls } = useHallStore();
  
  const pilgrimStats = isMounted ? getPilgrimStats() : {
    total: 0,
    arrived: 0,
    expected: 0,
    departed: 0,
    noShow: 0,
    specialNeeds: 0,
    maleCount: 0,
    femaleCount: 0,
    occupancyRate: 0,
    byNationality: {},
    byAgeGroup: {}
  };
  
  const hallStats = isMounted ? getHallStats() : {
    totalHalls: 0,
    totalBeds: 0,
    totalOccupied: 0,
    occupancyRate: 0,
    maleHalls: { total: 0, beds: 0, occupied: 0 },
    femaleHalls: { total: 0, beds: 0, occupied: 0 }
  };
  
  useEffect(() => {
    setIsMounted(true);
    fetchPilgrims();
    fetchHalls();
  }, []);
  
  return (
    <main className="p-4 sm:p-6">
      <div>
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {t('nav.dashboard')}
              </h1>
              <p className="text-gray-600">
                {`${t('app.welcome')} - ${new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
              </p>
            </div>
            <QuickActions locale={locale} />
          </div>
          
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {t('dashboard.overview')}
              </h2>
              <StatisticsCards
                pilgrimStats={pilgrimStats}
                hallStats={hallStats}
                isLoading={!isMounted}
                locale={locale}
              />
            </div>

            {/* Charts Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {t('dashboard.analyticsStats')}
              </h2>
              <Charts
                pilgrimStats={pilgrimStats}
                hallStats={hallStats}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}