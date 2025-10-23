'use client';

import { Card } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#374151" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

export function Charts({ pilgrimStats, hallStats, locale }: ChartsProps) {
  const t = useTranslations();

  const arrivalTrends = [
    { day: t('dashboard.charts.days.sat'), arrivals: 45, expected: 50, difference: -5 },
    { day: t('dashboard.charts.days.sun'), arrivals: 52, expected: 48, difference: 4 },
    { day: t('dashboard.charts.days.mon'), arrivals: 38, expected: 42, difference: -4 },
    { day: t('dashboard.charts.days.tue'), arrivals: 60, expected: 55, difference: 5 },
    { day: t('dashboard.charts.days.wed'), arrivals: 48, expected: 52, difference: -4 },
    { day: t('dashboard.charts.days.thu'), arrivals: 55, expected: 58, difference: -3 },
    { day: t('dashboard.charts.days.fri'), arrivals: 42, expected: 45, difference: -3 },
  ];

  const nationalityData = Object.entries(pilgrimStats?.byNationality || {})
    .map(([country, count]) => ({
      name: country,
      value: count as number,
      percentage: ((count as number / (pilgrimStats?.total || 1)) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const ageGroupData = [
    { age: '18-30', male: 25, female: 20, total: 45 },
    { age: '31-40', male: 35, female: 30, total: 65 },
    { age: '41-50', male: 45, female: 38, total: 83 },
    { age: '51-60', male: 40, female: 42, total: 82 },
    { age: '60+', male: 30, female: 35, total: 65 },
  ];

  const hallsOccupancyData = Object.entries(hallStats?.byHall || {})
    .map(([id, hall]: [string, any]) => ({
      name: hall.name,
      pilgrims: hall.occupancy,
      capacity: hall.capacity,
      occupancy: hall.rate
    }))
    .sort((a, b) => b.occupancy - a.occupancy);

  const genderDistribution = [
    { name: t('dashboard.charts.male'), value: pilgrimStats?.maleCount || 0, fill: '#3B82F6' },
    { name: t('dashboard.charts.female'), value: pilgrimStats?.femaleCount || 0, fill: '#EC4899' }
  ];

  const occupancyOverview = [
    { name: t('dashboard.charts.occupancy'), value: hallStats?.occupancyRate || 0, fill: '#10B981' }
  ];

  const COLORS = {
    primary: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    secondary: ['#60A5FA', '#34D399', '#FCD34D', '#F87171', '#A78BFA'],
    accent: '#EC4899'
  };

  return (
    <div className="space-y-6">
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Occupancy Rate Overview */}
        <ChartCard
          title={t('dashboard.charts.overallOccupancyRate')}
          subtitle={`${hallStats?.totalOccupied || 0}/${hallStats?.totalBeds || 0} ${t('dashboard.charts.bedsOccupied')}`}
        >
          <div className="flex items-center justify-center h-[250px]">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={occupancyOverview}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={(hallStats?.occupancyRate || 0) > 90 ? '#EF4444' : (hallStats?.occupancyRate || 0) > 75 ? '#F59E0B' : '#10B981'}
                    background={{ fill: '#F3F4F6' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                  {(hallStats?.occupancyRate || 0).toFixed(0)}%
                </span>
                <span className="text-sm text-gray-500">
                  {t('dashboard.charts.occupancy')}
                </span>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Halls Occupancy - Modern List View */}
        <ChartCard
          title={t('dashboard.charts.hallsOccupancy')}
          subtitle={t('dashboard.charts.occupancyByHall')}
        >
          <div className="space-y-3">
            {hallsOccupancyData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('halls.messages.notFound')}</p>
              </div>
            ) : (
              hallsOccupancyData.map((hall, index) => (
                <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{hall.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {hall.pilgrims}/{hall.capacity}
                    </span>
                    <span className={`font-semibold ${
                      hall.occupancy > 90 ? 'text-red-600' :
                      hall.occupancy > 75 ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {hall.occupancy.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      hall.occupancy > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      hall.occupancy > 75 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                      'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ width: `${hall.occupancy}%` }}
                  />
                </div>
              </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}