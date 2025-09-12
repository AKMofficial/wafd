'use client';

import { Card } from '@/components/ui/card';
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
  const arrivalTrends = [
    { day: locale === 'ar' ? 'السبت' : 'Sat', arrivals: 45, expected: 50, difference: -5 },
    { day: locale === 'ar' ? 'الأحد' : 'Sun', arrivals: 52, expected: 48, difference: 4 },
    { day: locale === 'ar' ? 'الإثنين' : 'Mon', arrivals: 38, expected: 42, difference: -4 },
    { day: locale === 'ar' ? 'الثلاثاء' : 'Tue', arrivals: 60, expected: 55, difference: 5 },
    { day: locale === 'ar' ? 'الأربعاء' : 'Wed', arrivals: 48, expected: 52, difference: -4 },
    { day: locale === 'ar' ? 'الخميس' : 'Thu', arrivals: 55, expected: 58, difference: -3 },
    { day: locale === 'ar' ? 'الجمعة' : 'Fri', arrivals: 42, expected: 45, difference: -3 },
  ];

  const nationalityData = Object.entries(pilgrimStats.byNationality || {})
    .map(([country, count]) => ({
      name: country,
      value: count as number,
      percentage: ((count as number / pilgrimStats.total) * 100).toFixed(1)
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

  const hallsOccupancyData = [
    { name: locale === 'ar' ? 'القاعة أ' : 'Hall A', pilgrims: 48, capacity: 50, occupancy: 96 },
    { name: locale === 'ar' ? 'القاعة ب' : 'Hall B', pilgrims: 45, capacity: 50, occupancy: 90 },
    { name: locale === 'ar' ? 'القاعة ج' : 'Hall C', pilgrims: 42, capacity: 50, occupancy: 84 },
    { name: locale === 'ar' ? 'القاعة د' : 'Hall D', pilgrims: 38, capacity: 50, occupancy: 76 },
    { name: locale === 'ar' ? 'القاعة هـ' : 'Hall E', pilgrims: 35, capacity: 50, occupancy: 70 },
    { name: locale === 'ar' ? 'القاعة و' : 'Hall F', pilgrims: 32, capacity: 50, occupancy: 64 },
  ].sort((a, b) => b.occupancy - a.occupancy);

  const genderDistribution = [
    { name: locale === 'ar' ? 'رجال' : 'Male', value: pilgrimStats.maleCount, fill: '#3B82F6' },
    { name: locale === 'ar' ? 'نساء' : 'Female', value: pilgrimStats.femaleCount, fill: '#EC4899' }
  ];

  const occupancyOverview = [
    { name: locale === 'ar' ? 'الإشغال' : 'Occupancy', value: hallStats.occupancyRate, fill: '#10B981' }
  ];

  const COLORS = {
    primary: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    secondary: ['#60A5FA', '#34D399', '#FCD34D', '#F87171', '#A78BFA'],
    accent: '#EC4899'
  };

  return (
    <div className="space-y-6">
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Arrival Trends - Wider */}
        <ChartCard 
          title={locale === 'ar' ? 'معدل الوصول' : 'Arrival Trends'}
          subtitle={locale === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={arrivalTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="arrivedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Area 
                type="monotone" 
                dataKey="arrivals" 
                stroke="#10B981" 
                strokeWidth={2}
                fill="url(#arrivedGradient)"
                name={locale === 'ar' ? 'وصلوا' : 'Arrived'}
              />
              <Area 
                type="monotone" 
                dataKey="expected" 
                stroke="#F59E0B" 
                strokeWidth={2}
                fill="url(#expectedGradient)"
                name={locale === 'ar' ? 'متوقع' : 'Expected'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gender Distribution - Radial */}
        <ChartCard 
          title={locale === 'ar' ? 'توزيع الجنس' : 'Gender Distribution'}
          subtitle={locale === 'ar' ? 'رجال و نساء' : 'Male & Female'}
        >
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="30%" 
              outerRadius="90%" 
              data={genderDistribution}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill="#8B5CF6"
                label={{ position: 'insideStart', fill: '#fff', fontSize: 14 }}
              />
              <Legend 
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Second Row - 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nationality Distribution - Improved */}
        <ChartCard 
          title={locale === 'ar' ? 'توزيع الجنسيات' : 'Nationality Distribution'}
          subtitle={locale === 'ar' ? 'أعلى 5 جنسيات' : 'Top 5 nationalities'}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={nationalityData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                name={locale === 'ar' ? 'عدد الحجاج' : 'Pilgrims'}
              >
                {nationalityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                ))}
                <LabelList 
                  dataKey="percentage" 
                  position="right" 
                  formatter={(value) => `${value}%`}
                  style={{ fontSize: '11px', fill: '#6B7280' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Age Distribution - Stacked */}
        <ChartCard 
          title={locale === 'ar' ? 'توزيع الأعمار' : 'Age Distribution'}
          subtitle={locale === 'ar' ? 'حسب الجنس' : 'By gender'}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={ageGroupData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="age"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="male" 
                stackId="a" 
                fill="#3B82F6" 
                name={locale === 'ar' ? 'رجال' : 'Male'}
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="female" 
                stackId="a" 
                fill="#EC4899" 
                name={locale === 'ar' ? 'نساء' : 'Female'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Halls Occupancy - Horizontal bars */}
        <ChartCard 
          title={locale === 'ar' ? 'إشغال القاعات' : 'Halls Occupancy'}
          subtitle={locale === 'ar' ? 'نسبة الإشغال' : 'Occupancy rate'}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={hallsOccupancyData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                width={45}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: any) => `${value}%`}
              />
              <Bar 
                dataKey="occupancy" 
                radius={[0, 4, 4, 0]}
                name={locale === 'ar' ? 'نسبة الإشغال' : 'Occupancy'}
              >
                {hallsOccupancyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.occupancy > 90 ? '#EF4444' : entry.occupancy > 75 ? '#F59E0B' : '#10B981'} 
                  />
                ))}
                <LabelList 
                  dataKey="pilgrims" 
                  position="right" 
                  formatter={(value) => `${value}/${hallsOccupancyData[0].capacity}`}
                  style={{ fontSize: '11px', fill: '#6B7280' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Third Row - Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Arrivals Comparison */}
        <ChartCard 
          title={locale === 'ar' ? 'مقارنة الوصول اليومي' : 'Daily Arrivals Comparison'}
          subtitle={locale === 'ar' ? 'الفعلي مقابل المتوقع' : 'Actual vs Expected'}
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart 
              data={arrivalTrends}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="day"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="arrivals" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name={locale === 'ar' ? 'وصلوا' : 'Arrived'}
              />
              <Line 
                type="monotone" 
                dataKey="expected" 
                stroke="#F59E0B" 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name={locale === 'ar' ? 'متوقع' : 'Expected'}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Occupancy Rate Overview */}
        <ChartCard 
          title={locale === 'ar' ? 'معدل الإشغال الإجمالي' : 'Overall Occupancy Rate'}
          subtitle={`${hallStats.totalOccupied}/${hallStats.totalBeds} ${locale === 'ar' ? 'سرير مشغول' : 'beds occupied'}`}
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
                    fill={hallStats.occupancyRate > 90 ? '#EF4444' : hallStats.occupancyRate > 75 ? '#F59E0B' : '#10B981'}
                    background={{ fill: '#F3F4F6' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                  {hallStats.occupancyRate.toFixed(0)}%
                </span>
                <span className="text-sm text-gray-500">
                  {locale === 'ar' ? 'نسبة الإشغال' : 'Occupancy'}
                </span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}