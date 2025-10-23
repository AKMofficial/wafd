'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { useHallStore } from '@/store/hall-store';
import { usePilgrimStore } from '@/store/pilgrim-store';
import { BedGrid } from '@/components/halls/bed-grid';
import { BedDetailsDialog } from '@/components/halls/bed-details-dialog';
import { HallSettingsDialog } from '@/components/halls/hall-settings-dialog';
import { AssignPilgrimDialog } from '@/components/halls/assign-pilgrim-dialog';
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
  Accessibility
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BedStatus } from '@/types/pilgrim';
import { Bed as BedType } from '@/types/hall';

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
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [bedToAssign, setBedToAssign] = useState<BedType | null>(null);
  
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
  
  const { pilgrims, fetchPilgrims } = usePilgrimStore();

  useEffect(() => {
    fetchHallById(hallId);
    fetchPilgrims();
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
            <p className="text-gray-500">{t('halls.messages.notFound')}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/${locale}/halls`)}
            >
              {t('common.back')}
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
    { value: 'all', label: t('halls.filters.all') },
    { value: 'vacant', label: t('halls.bedStatus.vacant') },
    { value: 'occupied', label: t('halls.bedStatus.occupied') },
    { value: 'reserved', label: t('halls.bedStatus.reserved') },
    { value: 'maintenance', label: t('halls.bedStatus.maintenance') },
  ];
  
  const handleBedClick = (bed: BedType) => {
    setSelectedBed(bed);
    setShowBedDetails(true);
  };
  
  
  const handleOpenAssignDialog = (bed: BedType) => {
    setBedToAssign(bed);
    setShowAssignDialog(true);
    setShowBedDetails(false);
  };

  const handleAssignPilgrim = async (pilgrimId: string, bedId: string) => {
    try {
      await assignBed({ bedId, pilgrimId });
    } catch (error) {
      console.error('Failed to assign bed:', error);
    }
  };
  
  const handleVacateBed = async (bedId: string) => {
    try {
      await vacateBed(bedId);
    } catch (error) {
      console.error('Failed to vacate bed:', error);
    }
  };
  
  const handleChangeBedStatus = async (bedId: string, status: BedStatus) => {
    try {
      await updateBedStatus(bedId, status);
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
              {t('common.back')}
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
                  {selectedHall.type === 'male' ? t('halls.hallType.male') : t('halls.hallType.female')}
                </Badge>
              </div>
              <p className="text-gray-600">
                {t('halls.capacity')}: {selectedHall.capacity} {t('halls.stats.bed')} • {t('halls.occupancy')}: {occupancy.rate.toFixed(0)}%
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowHallSettings(true)}>
                <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t('halls.settingsDialog.title')}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('halls.totalBeds')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{selectedHall.capacity}</span>
                <Building className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('halls.occupiedBeds')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {selectedHall.currentOccupancy}
                </span>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('halls.availableBeds')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {selectedHall.availableBeds}
                </span>
                <Bed className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('halls.specialNeeds')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">
                  {selectedHall.specialNeedsOccupancy}
                </span>
                <Accessibility className="h-8 w-8 text-purple-500" />
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
                placeholder={t('halls.searchBeds')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('halls.filters.status')} />
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
          onAssignPilgrim={(bedId) => handleOpenAssignDialog(selectedBed!)}
          onVacateBed={handleVacateBed}
          onChangeBedStatus={handleChangeBedStatus}
        />

        <AssignPilgrimDialog
          bed={bedToAssign}
          pilgrims={pilgrims}
          isOpen={showAssignDialog}
          onClose={() => {
            setShowAssignDialog(false);
            setBedToAssign(null);
          }}
          onAssign={handleAssignPilgrim}
        />

        <HallSettingsDialog
          hall={selectedHall}
          isOpen={showHallSettings}
          onClose={() => setShowHallSettings(false)}
          onSuccess={() => fetchHallById(hallId)}
        />
      </div>
    </main>
  );
}