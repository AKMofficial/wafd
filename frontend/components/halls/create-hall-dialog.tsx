'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations, useLocale } from '@/lib/i18n';
import { CreateHallDto, HallType, DEFAULT_NUMBERING_CONFIG } from '@/types/hall';
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
import { Plus, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBedNumberingPreview } from '@/lib/bed-numbering';

type CreateHallFormData = {
  name: string;
  code: string;
  type: HallType;
  capacity: number;
};

interface CreateHallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateHallDialog({ isOpen, onClose, onSuccess }: CreateHallDialogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { createHall, halls } = useHallStore();
  const [isLoading, setIsLoading] = useState(false);

  const createHallSchema = useMemo(() => z.object({
    name: z.string().min(1, t('halls.createDialog.validation.nameRequired')),
    code: z.string().regex(/^[A-Z]$/, t('halls.createDialog.validation.codeFormat')),
    type: z.enum(['male', 'female']),
    capacity: z.number()
      .min(10, t('halls.createDialog.validation.capacityMin'))
      .max(200, t('halls.createDialog.validation.capacityMax')),
  }), [t]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateHallFormData>({
    resolver: zodResolver(createHallSchema),
    defaultValues: {
      name: '',
      code: '',
      type: 'male',
      capacity: 50,
    },
  });
  
  const hallType = watch('type');
  const hallCode = watch('code');
  const capacity = watch('capacity');
  
  // Get next available hall code
  const getNextAvailableCode = (type: HallType): string => {
    const existingCodes = halls
      .filter(h => h.type === type)
      .map(h => h.code);
    
    const startChar = type === 'male' ? 'A' : 'E';
    for (let i = 0; i < 26; i++) {
      const code = String.fromCharCode(startChar.charCodeAt(0) + i);
      if (!existingCodes.includes(code)) {
        return code;
      }
    }
    return '';
  };
  
  // Auto-generate code when type changes
  const handleTypeChange = (type: HallType) => {
    setValue('type', type);
    const nextCode = getNextAvailableCode(type);
    if (nextCode) {
      setValue('code', nextCode);
    }
  };
  
  const onSubmit = async (data: CreateHallFormData) => {
    setIsLoading(true);
    
    try {
      const hallData: CreateHallDto = {
        ...data,
        numberingFormat: 'standard',
        numberingConfig: DEFAULT_NUMBERING_CONFIG[data.type],
      };
      
      await createHall(hallData);
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create hall:', error);
      alert(t('halls.createDialog.failedToCreate'));
    }
    
    setIsLoading(false);
  };
  
  const numberingConfig = DEFAULT_NUMBERING_CONFIG[hallType];
  const previewNumbers = hallCode ? getBedNumberingPreview(hallCode, hallType, numberingConfig, 5) : [];
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {
      reset();
      onClose();
    }}>
      <DialogContent className="max-w-md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {t('halls.createDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('halls.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hall Type */}
          <div>
            <Label htmlFor="type">
              {t('halls.createDialog.hallType')}
            </Label>
            <Select
              value={hallType}
              onValueChange={(value) => handleTypeChange(value as HallType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">
                  {t('halls.hallType.male')}
                </SelectItem>
                <SelectItem value="female">
                  {t('halls.hallType.female')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hall Name */}
          <div>
            <Label htmlFor="name">
              {t('halls.createDialog.hallName')}
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('halls.createDialog.exampleName')}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Hall Code */}
          <div>
            <Label htmlFor="code">
              {t('halls.createDialog.hallCode')}
            </Label>
            <Input
              id="code"
              {...register('code')}
              placeholder="A-Z"
              maxLength={1}
              className="uppercase"
            />
            {errors.code && (
              <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <Label htmlFor="capacity">
              {t('halls.createDialog.capacity')}
            </Label>
            <Input
              id="capacity"
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              min={10}
              max={200}
            />
            {errors.capacity && (
              <p className="text-sm text-red-500 mt-1">{errors.capacity.message}</p>
            )}
          </div>
          
          {/* Bed Numbering Preview */}
          {previewNumbers.length > 0 && (
            <Card className="p-4 space-y-3 bg-gray-50">
              <h3 className="font-semibold text-sm">
                {t('halls.createDialog.bedNumberingPreview')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {previewNumbers.map((num, i) => (
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {isLoading
                ? t('halls.createDialog.creating')
                : t('halls.createDialog.createHall')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}