'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations, useLocale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CreatePilgrimDto, UpdatePilgrimDto, Pilgrim } from '@/types/pilgrim';
import { CalendarIcon, Loader2 } from 'lucide-react';

const pilgrimSchema = z.object({
  registrationNumber: z.string().min(1, 'رقم التسجيل مطلوب'),
  nationalId: z.string().min(10, 'رقم الهوية يجب أن يكون 10 أرقام على الأقل'),
  passportNumber: z.string().optional(),
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
  birthDate: z.string().min(1, 'تاريخ الميلاد مطلوب'),
  gender: z.enum(['male', 'female']),
  nationality: z.string().min(1, 'الجنسية مطلوبة'),
  phoneNumber: z.string().min(10, 'رقم الهاتف مطلوب'),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  hasSpecialNeeds: z.boolean().default(false),
  specialNeedsType: z.string().optional(),
  specialNeedsNotes: z.string().optional(),
  groupId: z.string().optional(),
  notes: z.string().optional(),
});

type PilgrimFormData = z.infer<typeof pilgrimSchema>;

interface PilgrimFormProps {
  pilgrim?: Pilgrim;
  onSubmit: (data: CreatePilgrimDto | UpdatePilgrimDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PilgrimForm({ pilgrim, onSubmit, onCancel, isLoading = false }: PilgrimFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isEdit = !!pilgrim;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PilgrimFormData>({
    resolver: zodResolver(pilgrimSchema),
    defaultValues: pilgrim ? {
      registrationNumber: pilgrim.registrationNumber,
      nationalId: pilgrim.nationalId,
      passportNumber: pilgrim.passportNumber || '',
      firstName: pilgrim.firstName,
      lastName: pilgrim.lastName,
      birthDate: new Date(pilgrim.birthDate).toISOString().split('T')[0],
      gender: pilgrim.gender,
      nationality: pilgrim.nationality,
      phoneNumber: pilgrim.phoneNumber,
      emergencyContact: pilgrim.emergencyContact || '',
      emergencyPhone: pilgrim.emergencyPhone || '',
      hasSpecialNeeds: pilgrim.hasSpecialNeeds,
      specialNeedsType: pilgrim.specialNeedsType || '',
      specialNeedsNotes: pilgrim.specialNeedsNotes || '',
      groupId: pilgrim.groupId || '',
      notes: pilgrim.notes || '',
    } : {
      gender: 'male',
      hasSpecialNeeds: false,
      nationality: 'السعودية',
    },
  });

  const hasSpecialNeeds = watch('hasSpecialNeeds');

  const onFormSubmit = async (data: PilgrimFormData) => {
    const formData: any = {
      ...data,
      birthDate: new Date(data.birthDate),
    };

    if (!hasSpecialNeeds) {
      delete formData.specialNeedsType;
      delete formData.specialNeedsNotes;
    }

    await onSubmit(formData);
  };

  const nationalities = [
    'السعودية',
    'الكويت',
    'البحرين',
    'قطر',
    'الإمارات',
    'عمان',
    'اليمن',
    'مصر',
    'الأردن',
    'فلسطين',
    'لبنان',
    'سوريا',
    'العراق',
    'المغرب',
    'الجزائر',
    'تونس',
    'ليبيا',
    'السودان',
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">
              {locale === 'ar' ? 'رقم التسجيل' : 'Registration Number'} *
            </Label>
            <Input
              id="registrationNumber"
              {...register('registrationNumber')}
              disabled={isEdit}
              className={cn(errors.registrationNumber && 'border-red-500')}
            />
            {errors.registrationNumber && (
              <p className="text-sm text-red-500">{errors.registrationNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalId">
              {locale === 'ar' ? 'رقم الهوية' : 'National ID'} *
            </Label>
            <Input
              id="nationalId"
              {...register('nationalId')}
              className={cn(errors.nationalId && 'border-red-500')}
            />
            {errors.nationalId && (
              <p className="text-sm text-red-500">{errors.nationalId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportNumber">
              {locale === 'ar' ? 'رقم الجواز' : 'Passport Number'}
            </Label>
            <Input
              id="passportNumber"
              {...register('passportNumber')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">
              {locale === 'ar' ? 'الجنسية' : 'Nationality'} *
            </Label>
            <Select
              value={watch('nationality')}
              onValueChange={(value) => setValue('nationality', value)}
            >
              <SelectTrigger className={cn(errors.nationality && 'border-red-500')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.nationality && (
              <p className="text-sm text-red-500">{errors.nationality.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {locale === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              {locale === 'ar' ? 'الاسم الأول' : 'First Name'} *
            </Label>
            <Input
              id="firstName"
              {...register('firstName')}
              className={cn(errors.firstName && 'border-red-500')}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              {locale === 'ar' ? 'الاسم الأخير' : 'Last Name'} *
            </Label>
            <Input
              id="lastName"
              {...register('lastName')}
              className={cn(errors.lastName && 'border-red-500')}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">
              {locale === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'} *
            </Label>
            <Input
              id="birthDate"
              type="date"
              {...register('birthDate')}
              className={cn(errors.birthDate && 'border-red-500')}
            />
            {errors.birthDate && (
              <p className="text-sm text-red-500">{errors.birthDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              {locale === 'ar' ? 'الجنس' : 'Gender'} *
            </Label>
            <Select
              value={watch('gender')}
              onValueChange={(value) => setValue('gender', value as 'male' | 'female')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">
                  {locale === 'ar' ? 'ذكر' : 'Male'}
                </SelectItem>
                <SelectItem value="female">
                  {locale === 'ar' ? 'أنثى' : 'Female'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {locale === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
            </Label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber')}
              placeholder="+966501234567"
              className={cn(errors.phoneNumber && 'border-red-500')}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">
              {locale === 'ar' ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}
            </Label>
            <Input
              id="emergencyContact"
              {...register('emergencyContact')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">
              {locale === 'ar' ? 'هاتف الطوارئ' : 'Emergency Phone'}
            </Label>
            <Input
              id="emergencyPhone"
              {...register('emergencyPhone')}
              placeholder="+966502345678"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {locale === 'ar' ? 'الاحتياجات الخاصة' : 'Special Needs'}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="hasSpecialNeeds"
              checked={hasSpecialNeeds}
              onCheckedChange={(checked) => setValue('hasSpecialNeeds', checked as boolean)}
            />
            <Label htmlFor="hasSpecialNeeds" className="cursor-pointer">
              {locale === 'ar' ? 'لديه احتياجات خاصة' : 'Has special needs'}
            </Label>
          </div>

          {hasSpecialNeeds && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="specialNeedsType">
                  {locale === 'ar' ? 'نوع الاحتياج' : 'Need Type'}
                </Label>
                <Select
                  value={watch('specialNeedsType') || ''}
                  onValueChange={(value) => setValue('specialNeedsType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'ar' ? 'اختر النوع' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheelchair">
                      {locale === 'ar' ? 'كرسي متحرك' : 'Wheelchair'}
                    </SelectItem>
                    <SelectItem value="visual">
                      {locale === 'ar' ? 'إعاقة بصرية' : 'Visual impairment'}
                    </SelectItem>
                    <SelectItem value="hearing">
                      {locale === 'ar' ? 'إعاقة سمعية' : 'Hearing impairment'}
                    </SelectItem>
                    <SelectItem value="mobility">
                      {locale === 'ar' ? 'صعوبة في الحركة' : 'Mobility issues'}
                    </SelectItem>
                    <SelectItem value="other">
                      {locale === 'ar' ? 'أخرى' : 'Other'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNeedsNotes">
                  {locale === 'ar' ? 'ملاحظات' : 'Notes'}
                </Label>
                <Input
                  id="specialNeedsNotes"
                  {...register('specialNeedsNotes')}
                  placeholder={locale === 'ar' ? 'تفاصيل إضافية...' : 'Additional details...'}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {locale === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">
              {locale === 'ar' ? 'ملاحظات' : 'Notes'}
            </Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={locale === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
          {isEdit 
            ? (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
            : (locale === 'ar' ? 'إضافة حاج' : 'Add Pilgrim')}
        </Button>
      </div>
    </form>
  );
}