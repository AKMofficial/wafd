'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { useHallStore } from '@/store/hall-store';
import { StatisticsCards } from '@/components/dashboard/statistics-cards';
import { Charts } from '@/components/dashboard/charts';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  const { getStatistics: getPilgrimStats, fetchPilgrims } = usePilgrimStore();
  const { getStatistics: getHallStats, fetchHalls } = useHallStore();

  // Check authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.replace(`/${locale}/login`);
        return;
      }
    }
  }, [router, locale]);

  // Redirect supervisors immediately
  useEffect(() => {
    if (user && user.role === 'Supervisor') {
      router.replace(`/${locale}/pilgrims`);
    }
  }, [user, router, locale]);

  useEffect(() => {
    if (user && user.role === 'Admin') {
      setIsMounted(true);
      fetchPilgrims();
      fetchHalls();
    }
  }, [user]);

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

  // Don't render anything for supervisors
  if (user && user.role === 'Supervisor') {
    return null;
  }
  
  return (
    <main className="p-4 sm:p-6">
      <div>
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('nav.dashboard')}
            </h1>
            <p className="text-gray-600">
              {`${t('app.welcome')} - ${new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            </p>
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