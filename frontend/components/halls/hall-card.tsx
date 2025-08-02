'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';
import { Hall } from '@/types/hall';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bed, 
  Users, 
  Accessibility,
  MoreVertical,
  Edit,
  Settings,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HallCardProps {
  hall: Hall;
  onEdit?: (hall: Hall) => void;
  onConfigure?: (hall: Hall) => void;
}

export function HallCard({ hall, onEdit, onConfigure }: HallCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const occupancyRate = hall.capacity > 0 
    ? (hall.currentOccupancy / hall.capacity) * 100 
    : 0;
  
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };
  
  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const handleViewDetails = () => {
    router.push(`/${locale}/halls/${hall.id}`);
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={handleViewDetails}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {hall.name}
              </h3>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-2 py-0.5",
                  hall.type === 'male' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-pink-50 text-pink-700 border-pink-200'
                )}
              >
                {hall.code}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {hall.type === 'male' ? 'قاعة رجال' : 'قاعة نساء'}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(hall);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onConfigure?.(hall);
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Occupancy Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">الإشغال</span>
            <span className={cn("font-medium", getOccupancyColor(occupancyRate).split(' ')[0])}>
              {hall.currentOccupancy}/{hall.capacity}
            </span>
          </div>
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn("absolute top-0 h-full transition-all duration-300", getProgressColor(occupancyRate))}
              style={{ 
                width: `${occupancyRate}%`,
                [isRTL ? 'right' : 'left']: 0 
              }}
            />
          </div>
          <div className={cn("text-xs text-center", getOccupancyColor(occupancyRate).split(' ')[0])}>
            {occupancyRate.toFixed(0)}% ممتلئة
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Bed className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">متاح</p>
              <p className="text-sm font-medium">{hall.availableBeds}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">مشغول</p>
              <p className="text-sm font-medium">{hall.currentOccupancy}</p>
            </div>
          </div>
        </div>
        
        {/* Special Needs Indicator */}
        {hall.specialNeedsOccupancy > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Accessibility className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-gray-600">
              {hall.specialNeedsOccupancy} احتياجات خاصة
            </span>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            <Eye className={cn("h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
            عرض التفاصيل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}