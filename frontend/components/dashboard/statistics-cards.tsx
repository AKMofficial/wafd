'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/lib/i18n';
import {
  Users,
  UserCheck,
  Clock,
  Accessibility,
  Building,
  Bed,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserX,
  CalendarClock,
  Home
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, color, trend, isLoading, subtitle }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden bg-white hover:shadow-md transition-all duration-200 border-gray-100">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && !isLoading && (
            <div className="flex items-center">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${color.replace('bg-', 'bg-opacity-30 bg-')}`} />
    </Card>
  );
}

interface StatisticsCardsProps {
  pilgrimStats: any;
  hallStats: any;
  isLoading: boolean;
  locale: string;
}

export function StatisticsCards({ pilgrimStats, hallStats, isLoading, locale }: StatisticsCardsProps) {
  const t = useTranslations();

  const cards = [
    {
      title: t('dashboard.stats.totalPilgrims'),
      value: pilgrimStats.total,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      trend: { value: 5.2, isPositive: true }
    },
    {
      title: t('dashboard.stats.arrived'),
      value: pilgrimStats.arrived,
      icon: UserCheck,
      color: 'text-green-600 bg-green-100',
      subtitle: `${((pilgrimStats.arrived / pilgrimStats.total) * 100).toFixed(1)}% ${t('dashboard.stats.ofTotal')}`
    },
    {
      title: t('dashboard.stats.expected'),
      value: pilgrimStats.expected,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
      subtitle: t('dashboard.stats.within48Hours')
    },
    {
      title: t('dashboard.stats.specialNeeds'),
      value: pilgrimStats.specialNeeds,
      icon: Accessibility,
      color: 'text-purple-600 bg-purple-100',
      subtitle: `${((pilgrimStats.specialNeeds / pilgrimStats.total) * 100).toFixed(1)}% ${t('dashboard.stats.ofTotal')}`
    },
    {
      title: t('dashboard.stats.departed'),
      value: pilgrimStats.departed,
      icon: CalendarClock,
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      title: t('dashboard.stats.noShow'),
      value: pilgrimStats.noShow,
      icon: UserX,
      color: 'text-red-600 bg-red-100',
      trend: pilgrimStats.noShow > 5 ? { value: 2.1, isPositive: false } : undefined
    },
    {
      title: t('dashboard.stats.totalHalls'),
      value: hallStats.totalHalls,
      icon: Building,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      title: t('dashboard.stats.totalBeds'),
      value: hallStats.totalBeds,
      icon: Bed,
      color: 'text-teal-600 bg-teal-100'
    },
    {
      title: t('dashboard.stats.occupiedBeds'),
      value: hallStats.totalOccupied,
      icon: Home,
      color: 'text-orange-600 bg-orange-100',
      subtitle: `${hallStats.totalBeds - hallStats.totalOccupied} ${t('dashboard.stats.available')}`
    },
    {
      title: t('dashboard.stats.occupancyRate'),
      value: `${hallStats.occupancyRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: hallStats.occupancyRate > 90 ? 'text-red-600 bg-red-100' : 'text-rose-600 bg-rose-100',
      trend: hallStats.occupancyRate > 75 ? { value: hallStats.occupancyRate - 75, isPositive: true } : undefined
    },
    {
      title: t('dashboard.stats.maleHalls'),
      value: hallStats.maleHalls.total,
      icon: Building,
      color: 'text-sky-600 bg-sky-100',
      subtitle: `${hallStats.maleHalls.occupied}/${hallStats.maleHalls.beds} ${t('dashboard.stats.occupied')}`
    },
    {
      title: t('dashboard.stats.femaleHalls'),
      value: hallStats.femaleHalls.total,
      icon: Building,
      color: 'text-pink-600 bg-pink-100',
      subtitle: `${hallStats.femaleHalls.occupied}/${hallStats.femaleHalls.beds} ${t('dashboard.stats.occupied')}`
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}