'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { useHallStore } from '@/store/hall-store';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { BedGrid } from '@/components/halls/bed-grid';
import { BedDetailsDialog } from '@/components/halls/bed-details-dialog';
import { HallSettingsDialog } from '@/components/halls/hall-settings-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  ArrowRight,
  Building,
  Users,
  Bed,
  Search,
  Filter,
  Settings,
  Download,
  Accessibility,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BedStatus } from '@/types/pilgrim';
import { Bed as BedType } from '@/types/hall';
import { exportHallToExcel, exportHallToPDF } from '@/lib/hall-export';

export default function HallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const hallId = params.id as string;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BedStatus | 'all'>('all');
  const [selectedBed, setSelectedBed] = useState<BedType | null>(null);
  const [showBedDetails, setShowBedDetails] = useState(false);
  const [showHallSettings, setShowHallSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    selectedHall,
    isLoading,
    fetchHallById,
    setBedFilters,
    getAvailableBeds,
    getHallOccupancy,
    assignBed,
    vacateBed,
    updateBedStatus,
  } = useHallStore();
  
  const { pilgrims } = usePilgrimStore();
  
  useEffect(() => {
    fetchHallById(hallId);
  }, [hallId]);
  
  useEffect(() => {
    const filters = {
      search: searchQuery,
      status: statusFilter === 'all' ? undefined : [statusFilter],
    };
    setBedFilters(filters);
  }, [searchQuery, statusFilter]);
  
  if (isLoading) {
    return (
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </main>
    );
  }
  
  if (!selectedHall) {
    return (
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">لم يتم العثور على القاعة</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push(`/${locale}/halls`)}
            >
              العودة إلى القاعات
            </Button>
          </div>
        </div>
      </main>
    );
  }
  
  const occupancy = getHallOccupancy(hallId);
  const filteredBeds = getAvailableBeds(hallId, {
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : [statusFilter],
  });
  
  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'vacant', label: 'شاغر' },
    { value: 'occupied', label: 'مشغول' },
    { value: 'reserved', label: 'محجوز' },
    { value: 'maintenance', label: 'صيانة' },
  ];
  
  const handleBedClick = (bed: BedType) => {
    setSelectedBed(bed);
    setShowBedDetails(true);
  };
  
  const handleExportExcel = async () => {
    if (!selectedHall) return;
    
    setIsExporting(true);
    try {
      // Create a map of pilgrims for quick lookup
      const pilgrimMap = new Map(pilgrims.map(p => [p.id, p]));
      await exportHallToExcel(selectedHall, pilgrimMap, locale);
    } catch (error) {
      console.error('Export failed:', error);
      alert(locale === 'ar' ? 'فشل في تصدير البيانات' : 'Failed to export data');
    }
    setIsExporting(false);
  };
  
  const handleExportPDF = async () => {
    if (!selectedHall) return;
    
    setIsExporting(true);
    try {
      const pilgrimMap = new Map(pilgrims.map(p => [p.id, p]));
      await exportHallToPDF(selectedHall, pilgrimMap, locale);
    } catch (error) {
      console.error('Export failed:', error);
      alert(locale === 'ar' ? 'فشل في تصدير البيانات' : 'Failed to export data');
    }
    setIsExporting(false);
  };
  
  const handleAssignPilgrim = (bedId: string) => {
    // In a real app, this would open a pilgrim selection dialog
    alert(locale === 'ar' ? 'سيتم فتح نافذة اختيار الحاج' : 'Pilgrim selection dialog will open');
  };
  
  const handleVacateBed = async (bedId: string) => {
    try {
      await vacateBed(bedId);
      await fetchHallById(hallId);
    } catch (error) {
      console.error('Failed to vacate bed:', error);
    }
  };
  
  const handleChangeBedStatus = async (bedId: string, status: BedStatus) => {
    try {
      await updateBedStatus(bedId, status);
      await fetchHallById(hallId);
    } catch (error) {
      console.error('Failed to update bed status:', error);
    }
  };
  
  return (
    <main className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/halls`)}
              className="gap-1"
            >
              {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              العودة
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {selectedHall.name}
                </h1>
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-sm px-3 py-1",
                    selectedHall.type === 'male' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-pink-50 text-pink-700 border-pink-200'
                  )}
                >
                  {selectedHall.code}
                </Badge>
                <Badge variant="secondary">
                  {selectedHall.type === 'male' ? 'قاعة رجال' : 'قاعة نساء'}
                </Badge>
              </div>
              <p className="text-gray-600">
                السعة: {selectedHall.capacity} سرير • الإشغال: {occupancy.rate.toFixed(0)}%
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => {
                    const dropdown = document.getElementById('export-dropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}
                  disabled={isExporting}
                >
                  <Download className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {isExporting ? 'جاري التصدير...' : 'تصدير'}
                </Button>
                <div
                  id="export-dropdown"
                  className="hidden absolute top-full mt-1 right-0 bg-white border rounded-md shadow-lg z-10 min-w-[150px]"
                >
                  <button
                    className="w-full px-4 py-2 text-right hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      document.getElementById('export-dropdown')?.classList.add('hidden');
                      handleExportExcel();
                    }}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </button>
                  <button
                    className="w-full px-4 py-2 text-right hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      document.getElementById('export-dropdown')?.classList.add('hidden');
                      handleExportPDF();
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </button>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowHallSettings(true)}>
                <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                إعدادات القاعة
              </Button>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي الأسرّة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{selectedHall.capacity}</span>
                <Building className="h-8 w-8 text-gray-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                أسرّة مشغولة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {selectedHall.currentOccupancy}
                </span>
                <Users className="h-8 w-8 text-green-100" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                أسرّة شاغرة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {selectedHall.availableBeds}
                </span>
                <Bed className="h-8 w-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                احتياجات خاصة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">
                  {selectedHall.specialNeedsOccupancy}
                </span>
                <Accessibility className="h-8 w-8 text-purple-100" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className={cn(
                "absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4",
                isRTL ? "right-3" : "left-3"
              )} />
              <Input
                type="text"
                placeholder="البحث برقم السرير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="حالة السرير" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Bed Grid */}
        <BedGrid 
          beds={filteredBeds}
          hallType={selectedHall.type}
          onBedClick={handleBedClick}
        />
        
        {/* Dialogs */}
        <BedDetailsDialog
          bed={selectedBed}
          isOpen={showBedDetails}
          onClose={() => {
            setShowBedDetails(false);
            setSelectedBed(null);
          }}
          onAssignPilgrim={handleAssignPilgrim}
          onVacateBed={handleVacateBed}
          onChangeBedStatus={handleChangeBedStatus}
        />
        
        <HallSettingsDialog
          hall={selectedHall}
          isOpen={showHallSettings}
          onClose={() => {
            setShowHallSettings(false);
            fetchHallById(hallId);
          }}
        />
      </div>
    </main>
  );
}