'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations, useLocale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CreatePilgrimDto, UpdatePilgrimDto, Pilgrim } from '@/types/pilgrim';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { formatDateAsHijri } from '@/lib/hijri-date';
import { getNationalityOptions } from '@/lib/nationalities';
import { mockGroups } from '@/lib/mock-data';

const pilgrimSchema = z.object({
  nationalId: z.string().min(10, 'رقم الهوية يجب أن يكون 10 أرقام على الأقل'),
  passportNumber: z.string().optional(),
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
  age: z.string().min(1, 'العمر مطلوب').refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1;
  }, 'يجب أن يكون العمر رقم صحيح'),
  gender: z.enum(['male', 'female']),
  nationality: z.string().min(1, 'الجنسية مطلوبة'),
  phoneNumber: z.string().min(10, 'رقم الهاتف مطلوب'),
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
      nationalId: pilgrim.nationalId,
      passportNumber: pilgrim.passportNumber || '',
      firstName: pilgrim.firstName,
      lastName: pilgrim.lastName,
      age: pilgrim.age?.toString() || '',
      gender: pilgrim.gender,
      nationality: pilgrim.nationality,
      phoneNumber: pilgrim.phoneNumber,
      specialNeedsType: pilgrim.specialNeedsType || '',
      specialNeedsNotes: pilgrim.specialNeedsNotes || '',
      groupId: pilgrim.groupId || '',
      notes: pilgrim.notes || '',
    } : {
      gender: 'male' as const,
      nationality: 'السعودية',
    },
  });

  // Get nationality options from the comprehensive list
  const nationalityOptions = getNationalityOptions();

  // Get group options from mock data
  const groupOptions = mockGroups.map(group => ({
    value: group.id,
    label: group.name
  }));

  const onFormSubmit = async (data: PilgrimFormData) => {
    const formData: any = {
      ...data,
      age: parseInt(data.age), // Convert age string to number
      hasSpecialNeeds: !!data.specialNeedsType && data.specialNeedsType !== '' && data.specialNeedsType !== '__placeholder__', // Set based on whether disability type is selected
    };

    // Clean up empty values and placeholder
    if (!formData.specialNeedsType || formData.specialNeedsType === '' || formData.specialNeedsType === '__placeholder__') {
      delete formData.specialNeedsType;
      delete formData.specialNeedsNotes;
      formData.hasSpecialNeeds = false;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <SearchableSelect
              value={watch('nationality') || ''}
              onValueChange={(value) => setValue('nationality', value)}
              options={nationalityOptions}
              placeholder={locale === 'ar' ? 'اختر الجنسية' : 'Select Nationality'}
              searchPlaceholder={locale === 'ar' ? 'البحث في الجنسيات...' : 'Search nationalities...'}
              noResultsText={locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
              clearable={false}
              isRTL={isRTL}
              className={cn(errors.nationality && 'border-red-500')}
            />
            {errors.nationality && (
              <p className="text-sm text-red-500">{errors.nationality.message}</p>
            )}
          </div>

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
            <Label htmlFor="groupId">
              {locale === 'ar' ? 'المجموعة' : 'Group'}
            </Label>
            <SearchableSelect
              value={watch('groupId') || ''}
              onValueChange={(value) => setValue('groupId', value)}
              options={groupOptions}
              placeholder={locale === 'ar' ? 'اختر المجموعة' : 'Select Group'}
              searchPlaceholder={locale === 'ar' ? 'البحث في المجموعات...' : 'Search groups...'}
              noResultsText={locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
              clearable={true}
              isRTL={isRTL}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNeedsType">
              {locale === 'ar' ? 'نوع الإعاقة' : 'Disability Type'}
            </Label>
            <Select
              value={watch('specialNeedsType') || ''}
              onValueChange={(value) => setValue('specialNeedsType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={locale === 'ar' ? 'اختر نوع الإعاقة' : 'Select disability type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" disabled>
                  {locale === 'ar' ? 'اختر نوع الإعاقة' : 'Select disability type'}
                </SelectItem>
                <SelectItem value="mobility">
                  {locale === 'ar' ? 'مساعدة في الحركة (كرسي متحرك، مشي)' : 'Mobility assistance (wheelchair, walking)'}
                </SelectItem>
                <SelectItem value="vision_hearing">
                  {locale === 'ar' ? 'مشاكل في البصر أو السمع' : 'Vision or hearing issues'}
                </SelectItem>
                <SelectItem value="medical_care">
                  {locale === 'ar' ? 'رعاية طبية خاصة' : 'Special medical care'}
                </SelectItem>
                <SelectItem value="elderly_cognitive">
                  {locale === 'ar' ? 'رعاية كبار السن أو إعاقة ذهنية' : 'Elderly care or cognitive disability'}
                </SelectItem>
                <SelectItem value="dietary_language">
                  {locale === 'ar' ? 'احتياجات غذائية أو لغوية' : 'Dietary or language assistance'}
                </SelectItem>
                <SelectItem value="other">
                  {locale === 'ar' ? 'أخرى' : 'Other'}
                </SelectItem>
              </SelectContent>
            </Select>
            {watch('specialNeedsType') === 'other' && (
              <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                {locale === 'ar' 
                  ? 'يرجى كتابة تفاصيل الإعاقة في حقل الملاحظات أدناه' 
                  : 'Please write the disability details in the Notes field below'}
              </p>
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
            <Label htmlFor="age">
              {locale === 'ar' ? 'العمر' : 'Age'} *
            </Label>
            <Input
              id="age"
              type="number"
              min="1"
              {...register('age')}
              placeholder={locale === 'ar' ? 'أدخل العمر' : 'Enter age'}
              className={cn(errors.age && 'border-red-500')}
            />
            {errors.age && (
              <p className="text-sm text-red-500">{errors.age.message}</p>
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