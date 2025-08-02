'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from '@/lib/i18n';
import { useHallStore } from '@/store/hall-store';
import { HallCard } from '@/components/halls/hall-card';
import { HallSettingsDialog } from '@/components/halls/hall-settings-dialog';
import { CreateHallDialog } from '@/components/halls/create-hall-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building, Users, Bed, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Hall } from '@/types/hall';

export default function HallsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [selectedHallForSettings, setSelectedHallForSettings] = useState<Hall | null>(null);
  const [showHallSettings, setShowHallSettings] = useState(false);
  const [showCreateHall, setShowCreateHall] = useState(false);
  
  const {
    halls,
    isLoading,
    fetchHalls,
    setFilters,
    getStatistics,
  } = useHallStore();
  
  const stats = getStatistics();
  
  useEffect(() => {
    setMounted(true);
    fetchHalls();
  }, []);
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters({ search: searchQuery });
      fetchHalls();
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);
  
  const maleHalls = halls.filter(h => h.type === 'male');
  const femaleHalls = halls.filter(h => h.type === 'female');
  
  const handleEditHall = (hall: Hall) => {
    setSelectedHallForSettings(hall);
    setShowHallSettings(true);
  };
  
  const handleConfigureHall = (hall: Hall) => {
    setSelectedHallForSettings(hall);
    setShowHallSettings(true);
  };
  
  const handleAddNewHall = () => {
    setShowCreateHall(true);
  };
  
  // Prevent hydration errors by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {t('nav.halls')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                إدارة القاعات وتوزيع الأسرّة
              </p>
            </div>
            <Button className="w-full sm:w-auto" onClick={handleAddNewHall}>
              <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              إضافة قاعة جديدة
            </Button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">إجمالي القاعات</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalHalls}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">إجمالي الأسرّة</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalBeds}</p>
              </div>
              <Bed className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">الأسرّة المشغولة</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalOccupied}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">نسبة الإشغال</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.occupancyRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              type="text"
              placeholder="البحث في القاعات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
            />
          </div>
        </div>
        
        {/* Halls Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="all">جميع القاعات</TabsTrigger>
            <TabsTrigger value="male">قسم الرجال</TabsTrigger>
            <TabsTrigger value="female">قسم النساء</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {/* Male Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-600">●</span>
                قسم الرجال
                <span className="text-sm font-normal text-gray-500">
                  ({stats.maleHalls.occupied}/{stats.maleHalls.beds} سرير)
                </span>
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-48" />
                  ))}
                </div>
              ) : maleHalls.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">لا توجد قاعات في قسم الرجال</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {maleHalls.map((hall) => (
                    <HallCard 
                      key={hall.id} 
                      hall={hall}
                      onEdit={handleEditHall}
                      onConfigure={handleConfigureHall}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Female Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-pink-600">●</span>
                قسم النساء
                <span className="text-sm font-normal text-gray-500">
                  ({stats.femaleHalls.occupied}/{stats.femaleHalls.beds} سرير)
                </span>
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-48" />
                  ))}
                </div>
              ) : femaleHalls.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">لا توجد قاعات في قسم النساء</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {femaleHalls.map((hall) => (
                    <HallCard 
                      key={hall.id} 
                      hall={hall}
                      onEdit={handleEditHall}
                      onConfigure={handleConfigureHall}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="male">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : maleHalls.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">لا توجد قاعات في قسم الرجال</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {maleHalls.map((hall) => (
                  <HallCard 
                    key={hall.id} 
                    hall={hall}
                    onEdit={handleEditHall}
                    onConfigure={handleConfigureHall}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="female">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : femaleHalls.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">لا توجد قاعات في قسم النساء</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {femaleHalls.map((hall) => (
                  <HallCard 
                    key={hall.id} 
                    hall={hall}
                    onEdit={handleEditHall}
                    onConfigure={handleConfigureHall}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Settings Dialog */}
        <HallSettingsDialog
          hall={selectedHallForSettings}
          isOpen={showHallSettings}
          onClose={() => {
            setShowHallSettings(false);
            setSelectedHallForSettings(null);
            fetchHalls();
          }}
        />
        
        {/* Create Hall Dialog */}
        <CreateHallDialog
          isOpen={showCreateHall}
          onClose={() => {
            setShowCreateHall(false);
            fetchHalls();
          }}
        />
      </div>
    </main>
  );
}