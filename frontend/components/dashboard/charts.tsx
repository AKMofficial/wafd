'use client';

import { Card } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <Card className={`p-6 bg-white shadow-sm hover:shadow-md transition-shadow border-gray-100 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

interface ChartsProps {
  pilgrimStats: any;
  hallStats: any;
  locale: string;
}

export function Charts({ pilgrimStats, hallStats, locale }: ChartsProps) {
  const t = useTranslations();

  // Gender Distribution Data (Real Data from API)
  const genderData = {
    labels: [t('dashboard.charts.male'), t('dashboard.charts.female')],
    datasets: [
      {
        label: t('dashboard.charts.pilgrims'),
        data: [pilgrimStats?.maleCount || 0, pilgrimStats?.femaleCount || 0],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#2563EB', '#DB2777'],
        borderWidth: 2,
      },
    ],
  };

  // Top Nationalities Data (Real Data from API)
  const nationalityData = Object.entries(pilgrimStats?.byNationality || {})
    .map(([country, count]) => ({
      name: country,
      value: count as number,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const topNationalitiesData = {
    labels: nationalityData.map(item => item.name),
    datasets: [
      {
        label: t('dashboard.charts.pilgrims'),
        data: nationalityData.map(item => item.value),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderColor: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'],
        borderWidth: 2,
      },
    ],
  };

  // Pilgrim Status Distribution Data (Real Data from API)
  const statusData = {
    labels: [
      t('dashboard.stats.arrived'),
      t('dashboard.stats.expected'),
      t('dashboard.stats.departed'),
      t('dashboard.stats.noShow'),
    ],
    datasets: [
      {
        label: t('dashboard.charts.pilgrims'),
        data: [
          pilgrimStats?.arrivedCount || 0,
          pilgrimStats?.expectedCount || 0,
          pilgrimStats?.departedCount || 0,
          pilgrimStats?.noShowCount || 0,
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
        borderColor: ['#059669', '#2563EB', '#D97706', '#DC2626'],
        borderWidth: 2,
      },
    ],
  };

  // Special Needs Distribution Data (Real Data from API)
  const specialNeedsEntries = Object.entries(pilgrimStats?.bySpecialNeeds || {})
    .filter(([_, count]) => (count as number) > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number));

  const specialNeedsData = {
    labels: specialNeedsEntries.map(([type]) => type),
    datasets: [
      {
        label: t('dashboard.charts.pilgrims'),
        data: specialNeedsEntries.map(([_, count]) => count as number),
        backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
        borderColor: ['#7C3AED', '#DB2777', '#D97706', '#059669', '#2563EB'],
        borderWidth: 2,
      },
    ],
  };

  // Male vs Female Halls Data (Real Data from API)
  const hallsByGenderData = {
    labels: [t('dashboard.charts.maleHalls'), t('dashboard.charts.femaleHalls')],
    datasets: [
      {
        label: t('dashboard.charts.halls'),
        data: [hallStats?.maleHalls?.count || 0, hallStats?.femaleHalls?.count || 0],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#2563EB', '#DB2777'],
        borderWidth: 2,
      },
    ],
  };

  // Occupancy Rate Data (Real Data from API)
  const occupancyRate = hallStats?.occupancyRate || 0;
  const occupancyColor = occupancyRate > 90 ? '#EF4444' : occupancyRate > 75 ? '#F59E0B' : '#10B981';
  
  const occupancyData = {
    labels: [t('dashboard.charts.occupied'), t('dashboard.charts.available')],
    datasets: [
      {
        label: t('dashboard.charts.beds'),
        data: [hallStats?.totalOccupied || 0, (hallStats?.totalBeds || 0) - (hallStats?.totalOccupied || 0)],
        backgroundColor: [occupancyColor, '#E5E7EB'],
        borderColor: [occupancyColor, '#D1D5DB'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: locale === 'ar' ? ('left' as const) : ('right' as const),
        labels: {
          font: {
            family: locale === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif',
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    indexAxis: locale === 'ar' ? ('y' as const) : ('x' as const),
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: locale === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif',
          },
        },
      },
      y: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          font: {
            family: locale === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif',
          },
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t('dashboard.stats.title')}
        </h2>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Occupancy Rate Doughnut Chart */}
          <ChartCard
            title={t('dashboard.charts.occupancy')}
            subtitle={`${occupancyRate.toFixed(1)}% ${t('dashboard.charts.occupied')}`}
          >
            <div style={{ height: '300px' }}>
              <Doughnut data={occupancyData} options={chartOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {hallStats?.totalOccupied || 0} / {hallStats?.totalBeds || 0} {t('dashboard.charts.beds')}
              </p>
            </div>
          </ChartCard>

          {/* Gender Distribution Pie Chart */}
          <ChartCard
            title={t('dashboard.charts.genderDistribution')}
            subtitle={t('dashboard.charts.genderBreakdown')}
          >
            <div style={{ height: '300px' }}>
              <Pie data={genderData} options={chartOptions} />
            </div>
          </ChartCard>

          {/* Top Nationalities Horizontal Bar Chart */}
          <ChartCard
            title={t('dashboard.charts.topNationalities')}
            subtitle={t('dashboard.charts.top5Countries')}
            className="xl:col-span-2"
          >
            <div style={{ height: '350px' }}>
              <Bar 
                data={topNationalitiesData} 
                options={{
                  ...barOptions,
                  indexAxis: 'y',
                }} 
              />
            </div>
          </ChartCard>

          {/* Pilgrim Status Distribution Pie Chart */}
          <ChartCard
            title={t('dashboard.charts.pilgrimStatus')}
            subtitle={t('dashboard.charts.statusBreakdown')}
          >
            <div style={{ height: '300px' }}>
              <Pie data={statusData} options={chartOptions} />
            </div>
          </ChartCard>

          {/* Special Needs Distribution Bar Chart */}
          <ChartCard
            title={t('dashboard.charts.specialNeeds')}
            subtitle={t('dashboard.charts.specialNeedsBreakdown')}
          >
            <div style={{ height: '300px' }}>
              <Bar data={specialNeedsData} options={barOptions} />
            </div>
          </ChartCard>

          {/* Male vs Female Halls Doughnut Chart */}
          <ChartCard
            title={t('dashboard.charts.hallsByGender')}
            subtitle={t('dashboard.charts.hallsGenderBreakdown')}
          >
            <div style={{ height: '300px' }}>
              <Doughnut data={hallsByGenderData} options={chartOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {t('dashboard.charts.totalHalls')}: {(hallStats?.maleHalls?.count || 0) + (hallStats?.femaleHalls?.count || 0)}
              </p>
            </div>
          </ChartCard>

          {/* Halls Occupancy List */}
          <ChartCard
            title={t('dashboard.charts.hallsOccupancy')}
            subtitle={t('dashboard.charts.byHall')}
            className="xl:col-span-2"
          >
            <div className="space-y-4">
              {Object.entries(hallStats?.byHall || {})
                .map(([id, hall]: [string, any]) => ({
                  id,
                  name: hall.name,
                  occupancy: hall.occupancy,
                  capacity: hall.capacity,
                  rate: hall.rate,
                }))
                .sort((a, b) => b.rate - a.rate)
                .slice(0, 8)
                .map((hall) => {
                  const rateColor =
                    hall.rate > 90
                      ? 'from-red-500 to-red-600'
                      : hall.rate > 75
                      ? 'from-amber-500 to-amber-600'
                      : 'from-green-500 to-green-600';

                  return (
                    <div key={hall.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{hall.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {hall.occupancy} / {hall.capacity}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right">
                            {hall.rate.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 ${locale === 'ar' ? 'right' : 'left'}-0 bg-gradient-to-r ${rateColor} rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${hall.rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
