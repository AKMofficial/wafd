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
      {/* Main Charts Grid - Row 1 */}
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

        {/* Gender Distribution - Pie Chart */}
        <ChartCard
          title={t('dashboard.charts.genderDistribution')}
          subtitle={`${t('dashboard.charts.totalPilgrims')}: ${pilgrimStats?.total || 0}`}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomPieLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-sm font-medium text-gray-700">
                    {value}: {entry.payload.value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 - Age Distribution & Nationality */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Age Group Distribution - Stacked Bar Chart */}
        <ChartCard
          title={t('dashboard.charts.ageDistribution')}
          subtitle={t('dashboard.charts.byAgeGroup')}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageGroupData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="age" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-sm font-medium text-gray-700">{value}</span>
                )}
              />
              <Bar dataKey="male" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} name={t('dashboard.charts.male')} />
              <Bar dataKey="female" stackId="a" fill="#EC4899" radius={[8, 8, 0, 0]} name={t('dashboard.charts.female')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Nationalities - Horizontal Bar Chart */}
        <ChartCard
          title={t('dashboard.charts.topNationalities')}
          subtitle={t('dashboard.charts.top5Countries')}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={nationalityData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 8, 8, 0]} name={t('dashboard.charts.pilgrims')}>
                <LabelList 
                  dataKey="percentage" 
                  position="right" 
                  formatter={(value: any) => `${value}%`}
                  style={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 - Arrival Trends & Hall Capacity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Arrival Trends - Area Chart */}
        <ChartCard
          title={t('dashboard.charts.arrivalTrends')}
          subtitle={t('dashboard.charts.weeklyOverview')}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={arrivalTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span className="text-sm font-medium text-gray-700">{value}</span>
                )}
              />
              <Area 
                type="monotone" 
                dataKey="arrivals" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorArrivals)"
                name={t('dashboard.charts.actualArrivals')}
              />
              <Area 
                type="monotone" 
                dataKey="expected" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorExpected)"
                name={t('dashboard.charts.expectedArrivals')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Halls Occupancy - Modern List View */}
        <ChartCard
          title={t('dashboard.charts.hallsOccupancy')}
          subtitle={t('dashboard.charts.occupancyByHall')}
        >
          <div className="space-y-3 h-[300px] overflow-y-auto pr-2">
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

      {/* Row 4 - Male vs Female Halls Comparison */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard
          title={t('dashboard.charts.hallsComparison')}
          subtitle={t('dashboard.charts.maleVsFemaleHalls')}
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={[
                {
                  type: t('dashboard.charts.maleHalls'),
                  halls: hallStats?.maleHalls?.total || 0,
                  beds: hallStats?.maleHalls?.beds || 0,
                  occupied: hallStats?.maleHalls?.occupied || 0,
                },
                {
                  type: t('dashboard.charts.femaleHalls'),
                  halls: hallStats?.femaleHalls?.total || 0,
                  beds: hallStats?.femaleHalls?.beds || 0,
                  occupied: hallStats?.femaleHalls?.occupied || 0,
                }
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="type" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-sm font-medium text-gray-700">{value}</span>
                )}
              />
              <Bar dataKey="halls" fill="#8B5CF6" radius={[8, 8, 0, 0]} name={t('dashboard.charts.numberOfHalls')} />
              <Bar dataKey="beds" fill="#3B82F6" radius={[8, 8, 0, 0]} name={t('dashboard.charts.totalBeds')} />
              <Bar dataKey="occupied" fill="#10B981" radius={[8, 8, 0, 0]} name={t('dashboard.charts.occupiedBeds')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}