'use client';

import { useState } from 'react';
import { Bed } from '@/types/hall';
import { HallType } from '@/types/hall';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Bed as BedIcon,
  User,
  Wrench,
  Lock,
  Accessibility,
} from 'lucide-react';

interface BedGridProps {
  beds: Bed[];
  hallType: HallType;
  onBedClick?: (bed: Bed) => void;
  selectedBedId?: string;
}

const statusConfig = {
  vacant: {
    label: 'شاغر',
    icon: BedIcon,
    color: 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300',
    iconColor: 'text-green-600',
  },
  occupied: {
    label: 'مشغول',
    icon: User,
    color: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300',
    iconColor: 'text-red-600',
  },
  reserved: {
    label: 'محجوز',
    icon: Lock,
    color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300',
    iconColor: 'text-yellow-600',
  },
  maintenance: {
    label: 'صيانة',
    icon: Wrench,
    color: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300',
    iconColor: 'text-gray-600',
  },
};

export function BedGrid({ beds, hallType, onBedClick, selectedBedId }: BedGridProps) {
  const [hoveredBed, setHoveredBed] = useState<string | null>(null);
  
  // Group beds by rows (10 beds per row)
  const bedsPerRow = 10;
  const rows: Bed[][] = [];
  
  for (let i = 0; i < beds.length; i += bedsPerRow) {
    rows.push(beds.slice(i, i + bedsPerRow));
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">خريطة الأسرّة</h3>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-md border-2 flex items-center justify-center",
                  config.color
                )}>
                  <Icon className={cn("h-4 w-4", config.iconColor)} />
                </div>
                <span className="text-sm text-gray-600">{config.label}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md border-2 border-purple-300 bg-purple-100 flex items-center justify-center">
              <Accessibility className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">احتياجات خاصة</span>
          </div>
        </div>
      </div>
      
      {/* Bed Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] space-y-3">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              <div className="w-12 flex items-center justify-center text-sm text-gray-500 font-medium">
                {rowIndex + 1}
              </div>
              <div className="flex gap-2 flex-1">
                {row.map((bed) => {
                  const config = statusConfig[bed.status];
                  const Icon = config.icon;
                  const isSelected = bed.id === selectedBedId;
                  const isHovered = bed.id === hoveredBed;
                  
                  return (
                    <TooltipProvider key={bed.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              "relative flex-1 h-16 rounded-md border-2 transition-all duration-200",
                              "flex flex-col items-center justify-center p-1",
                              config.color,
                              isSelected && "ring-2 ring-blue-500 ring-offset-2",
                              "cursor-pointer"
                            )}
                            onClick={() => onBedClick?.(bed)}
                            onMouseEnter={() => setHoveredBed(bed.id)}
                            onMouseLeave={() => setHoveredBed(null)}
                          >
                            <Icon className={cn("h-5 w-5 mb-1", config.iconColor)} />
                            <span className="text-xs font-medium">{bed.number}</span>
                            
                            {bed.isSpecialNeeds && (
                              <div className="absolute top-0.5 right-0.5">
                                <Accessibility className="h-3 w-3 text-purple-600" />
                              </div>
                            )}
                            
                            {bed.isDoubleBed && (
                              <div className="absolute top-0.5 left-0.5">
                                <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                                  2
                                </Badge>
                              </div>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium mb-1">سرير {bed.number}</p>
                            <p>الحالة: {config.label}</p>
                            {bed.pilgrimId && (
                              <p className="text-xs text-gray-500 mt-1">
                                معرف الحاج: {bed.pilgrimId}
                              </p>
                            )}
                            {bed.maintenanceNotes && (
                              <p className="text-xs text-gray-500 mt-1">
                                {bed.maintenanceNotes}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                
                {/* Fill empty spaces in the last row */}
                {row.length < bedsPerRow && Array.from({ length: bedsPerRow - row.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile View - Card Layout */}
      <div className="lg:hidden mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {beds.map((bed) => {
            const config = statusConfig[bed.status];
            const Icon = config.icon;
            
            return (
              <Card
                key={bed.id}
                className={cn(
                  "p-3 cursor-pointer transition-all",
                  config.color.replace('hover:', ''),
                  selectedBedId === bed.id && "ring-2 ring-blue-500"
                )}
                onClick={() => onBedClick?.(bed)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{bed.number}</span>
                  {bed.isSpecialNeeds && (
                    <Accessibility className="h-4 w-4 text-purple-600" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", config.iconColor)} />
                  <span className="text-xs">{config.label}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}