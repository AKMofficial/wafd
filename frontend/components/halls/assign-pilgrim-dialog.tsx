'use client';

import { useState, useMemo } from 'react';
import { useLocale, useTranslations } from '@/lib/i18n';
import { Pilgrim } from '@/types/pilgrim';
import { Bed } from '@/types/hall';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Phone, MapPin, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignPilgrimDialogProps {
  bed: Bed | null;
  pilgrims: Pilgrim[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (pilgrimId: string, bedId: string) => void;
  isLoading?: boolean;
}

export function AssignPilgrimDialog({
  bed,
  pilgrims,
  isOpen,
  onClose,
  onAssign,
  isLoading = false,
}: AssignPilgrimDialogProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isRTL = locale === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPilgrim, setSelectedPilgrim] = useState<Pilgrim | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availablePilgrims = useMemo(() => {
    return pilgrims.filter(p => p.status === 'expected' || p.status === 'arrived');
  }, [pilgrims]);

  const filteredPilgrims = useMemo(() => {
    if (!searchQuery.trim()) return availablePilgrims;

    const query = searchQuery.toLowerCase();
    return availablePilgrims.filter(pilgrim => {
      return (
        pilgrim.fullName?.toLowerCase().includes(query) ||
        pilgrim.firstName?.toLowerCase().includes(query) ||
        pilgrim.lastName?.toLowerCase().includes(query) ||
        pilgrim.passportNumber?.toLowerCase().includes(query) ||
        pilgrim.registrationNumber?.toLowerCase().includes(query) ||
        pilgrim.nationalId?.toLowerCase().includes(query) ||
        pilgrim.phoneNumber?.includes(query) ||
        pilgrim.nationality?.toLowerCase().includes(query)
      );
    });
  }, [availablePilgrims, searchQuery]);

  const handleAssign = async () => {
    if (selectedPilgrim && bed) {
      setError(null);
      try {
        await onAssign(selectedPilgrim.id, bed.id);
        handleClose();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to assign pilgrim to bed';
        setError(errorMessage);
      }
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedPilgrim(null);
    setError(null);
    onClose();
  };

  if (!bed) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('halls.assignDialog.title')} - {bed.number}
          </DialogTitle>
          <DialogDescription>
            {t('halls.assignDialog.description')}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">{t('common.error')}</p>
              <p className="text-red-800 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              type="text"
              placeholder={t('halls.assignDialog.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={cn(
                  "absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600",
                  isRTL ? "left-3" : "right-3"
                )}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {filteredPilgrims.length} {t('halls.assignDialog.foundResults')}
          </div>

          {/* Pilgrims List */}
          <ScrollArea className="h-[400px] border rounded-md">
            <div className="p-2 space-y-2">
              {filteredPilgrims.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>{t('halls.assignDialog.noPilgrims')}</p>
                </div>
              ) : (
                filteredPilgrims.map((pilgrim) => (
                  <button
                    key={pilgrim.id}
                    onClick={() => setSelectedPilgrim(pilgrim)}
                    className={cn(
                      "w-full text-right p-3 rounded-lg border-2 transition-all hover:border-blue-300 hover:bg-blue-50",
                      selectedPilgrim?.id === pilgrim.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 text-right space-y-1">
                        <div className="font-semibold text-gray-900">
                          {pilgrim.fullName}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          {pilgrim.registrationNumber && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{pilgrim.registrationNumber}</span>
                            </div>
                          )}

                          {pilgrim.passportNumber && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{pilgrim.passportNumber}</span>
                            </div>
                          )}

                          {pilgrim.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span dir="ltr">{pilgrim.phoneNumber}</span>
                            </div>
                          )}

                          {pilgrim.nationality && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{pilgrim.nationality}</span>
                            </div>
                          )}
                        </div>

                        {pilgrim.groupName && (
                          <Badge variant="outline" className="text-xs">
                            {pilgrim.groupName}
                          </Badge>
                        )}
                      </div>

                      {pilgrim.hasSpecialNeeds && (
                        <Badge variant="secondary" className="text-purple-600 bg-purple-50">
                          {t('pilgrims.filters.specialNeeds')}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAssign}
              disabled={!selectedPilgrim || isLoading}
              className="flex-1"
            >
              {isLoading ? t('common.loading') : t('halls.assignDialog.assign')}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
