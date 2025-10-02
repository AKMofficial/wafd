'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from '@/lib/i18n';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Settings, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBedNumberingPreview } from '@/lib/bed-numbering';

interface HallSettingsDialogProps {
  hall: Hall | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function HallSettingsDialog({ hall, isOpen, onClose, onSuccess }: HallSettingsDialogProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isRTL = locale === 'ar';
  const { updateHall, deleteHall } = useHallStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update hall:', error);
      alert(t('halls.settingsDialog.failedToUpdate'));
    }
    
    setIsLoading(false);
  };
  
  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      const success = await deleteHall(hall.id);
      if (success) {
        onSuccess?.();
        onClose();
        // Navigate back to halls page after deletion
        window.location.href = `/${locale}/halls`;
      } else {
        alert(t('halls.settingsDialog.failedToUpdate'));
      }
    } catch (error) {
      console.error('Failed to delete hall:', error);
      alert(t('halls.settingsDialog.failedToUpdate'));
    }
    
    setIsLoading(false);
    setShowDeleteConfirm(false);
  };
  
  const canChangeCapacity = hall.currentOccupancy === 0;
  const canDelete = hall.currentOccupancy === 0;
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {
        // Reset form data when closing
        if (hall) {
          setFormData({
            id: hall.id,
            name: hall.name,
            capacity: hall.capacity,
          });
        }
        setShowDeleteConfirm(false);
        onClose();
      }}>
        <DialogContent className="max-w-md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('halls.settingsDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('halls.settingsDialog.description')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hall Information */}
          <Card className="p-4 space-y-3 bg-gray-50">
            <h3 className="font-semibold text-sm">
              {t('halls.settingsDialog.hallInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">
                  {t('halls.createDialog.hallCode')}
                </span>
                <p className="font-medium">{hall.code}</p>
              </div>
              <div>
                <span className="text-gray-600">
                  {t('halls.createDialog.hallType')}
                </span>
                <p className="font-medium">
                  {hall.type === 'male'
                    ? t('halls.hallType.male')
                    : t('halls.hallType.female')
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-600">
                  {t('halls.occupancy')}
                </span>
                <p className="font-medium">{hall.currentOccupancy}/{hall.capacity}</p>
              </div>
              <div>
                <span className="text-gray-600">
                  {t('halls.availableBeds')}
                </span>
                <p className="font-medium">{hall.availableBeds}</p>
              </div>
            </div>
          </Card>
          
          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                {t('halls.createDialog.hallName')}
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
                {t('halls.capacity')}
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
                    {t('halls.messages.deleteError')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Bed Numbering Preview */}
          {hall.numberingConfig && (
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">
                {t('halls.settingsDialog.bedNumbering')}
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
          
          <DialogFooter className="flex justify-between pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={!canDelete || isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      {t('common.delete')} {t('halls.hallDetails')}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canDelete && (
                  <TooltipContent>
                    <p>{t('halls.messages.deleteError')}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t('halls.settingsDialog.updating')
                  : t('common.saveChanges')
                }
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    
    {/* Delete Confirmation Dialog */}
    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {t('halls.settingsDialog.confirmDelete')}
          </DialogTitle>
          <DialogDescription>
            {t('halls.settingsDialog.deleteWarning').replace('{name}', hall?.name || '')}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">
              {t('halls.settingsDialog.deleteNote')}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? t('halls.settingsDialog.deleting') : t('halls.settingsDialog.deleteHall')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}