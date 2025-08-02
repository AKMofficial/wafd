'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/i18n';
import { Hall, UpdateHallDto } from '@/types/hall';
import { useHallStore } from '@/store/hall-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBedNumberingPreview } from '@/lib/bed-numbering';

interface HallSettingsDialogProps {
  hall: Hall | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HallSettingsDialog({ hall, isOpen, onClose }: HallSettingsDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { updateHall } = useHallStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateHallDto>({
    id: '',
    name: '',
    capacity: 0,
  });
  
  // Reset form when hall changes
  useState(() => {
    if (hall) {
      setFormData({
        id: hall.id,
        name: hall.name,
        capacity: hall.capacity,
      });
    }
  });
  
  if (!hall) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateHall(hall.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update hall:', error);
      alert(locale === 'ar' ? 'فشل في تحديث القاعة' : 'Failed to update hall');
    }
    
    setIsLoading(false);
  };
  
  const canChangeCapacity = hall.currentOccupancy === 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {locale === 'ar' ? 'إعدادات القاعة' : 'Hall Settings'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar' 
              ? 'تعديل إعدادات القاعة ومعلوماتها' 
              : 'Edit hall settings and information'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hall Information */}
          <Card className="p-4 space-y-3 bg-gray-50">
            <h3 className="font-semibold text-sm">
              {locale === 'ar' ? 'معلومات القاعة' : 'Hall Information'}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">
                  {locale === 'ar' ? 'رمز القاعة' : 'Hall Code'}
                </span>
                <p className="font-medium">{hall.code}</p>
              </div>
              <div>
                <span className="text-gray-600">
                  {locale === 'ar' ? 'النوع' : 'Type'}
                </span>
                <p className="font-medium">
                  {hall.type === 'male' 
                    ? (locale === 'ar' ? 'قاعة رجال' : 'Male Hall')
                    : (locale === 'ar' ? 'قاعة نساء' : 'Female Hall')
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-600">
                  {locale === 'ar' ? 'الإشغال الحالي' : 'Current Occupancy'}
                </span>
                <p className="font-medium">{hall.currentOccupancy}/{hall.capacity}</p>
              </div>
              <div>
                <span className="text-gray-600">
                  {locale === 'ar' ? 'الأسرّة المتاحة' : 'Available Beds'}
                </span>
                <p className="font-medium">{hall.availableBeds}</p>
              </div>
            </div>
          </Card>
          
          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                {locale === 'ar' ? 'اسم القاعة' : 'Hall Name'}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            
            <div>
              <Label htmlFor="capacity">
                {locale === 'ar' ? 'السعة الإجمالية' : 'Total Capacity'}
              </Label>
              <Input
                id="capacity"
                type="number"
                min={hall.currentOccupancy}
                max={200}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                disabled={!canChangeCapacity}
                required
              />
              {!canChangeCapacity && (
                <div className="flex items-center gap-2 mt-2 text-sm text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {locale === 'ar' 
                      ? 'لا يمكن تغيير السعة عندما تكون هناك أسرّة مشغولة' 
                      : 'Cannot change capacity when beds are occupied'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Bed Numbering Preview */}
          {hall.numberingConfig && (
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">
                {locale === 'ar' ? 'نظام ترقيم الأسرّة' : 'Bed Numbering System'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {getBedNumberingPreview(hall.code, hall.type, hall.numberingConfig).map((num, i) => (
                  <Badge key={i} variant="outline" className="font-mono">
                    {num}
                  </Badge>
                ))}
                <span className="text-sm text-gray-500">...</span>
              </div>
            </Card>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                : (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}