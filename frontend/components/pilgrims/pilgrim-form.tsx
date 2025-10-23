'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { groupAPI } from '@/lib/api';

type PilgrimFormData = {
  nationalId: string;
  passportNumber?: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: 'male' | 'female';
  nationality: string;
  phoneNumber: string;
  specialNeedsType?: string;
  specialNeedsNotes?: string;
  groupId: string;
  notes?: string;
};

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

  // Create schema with translated messages
  const pilgrimSchema = useMemo(() => z.object({
    nationalId: z.string().min(10, t('pilgrims.validation.nationalIdMin')),
    passportNumber: z.string().optional(),
    firstName: z.string().min(2, t('pilgrims.validation.firstNameRequired')),
    lastName: z.string().min(2, t('pilgrims.validation.lastNameRequired')),
    age: z.string().min(1, t('pilgrims.validation.ageRequired')).refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1;
    }, t('pilgrims.validation.ageMustBeNumber')),
    gender: z.enum(['male', 'female']),
    nationality: z.string().min(1, t('pilgrims.validation.nationalityRequired')),
    phoneNumber: z.string().min(10, t('pilgrims.validation.phoneRequired')),
    specialNeedsType: z.string().optional(),
    specialNeedsNotes: z.string().optional(),
    groupId: z.string().min(1, t('pilgrims.validation.groupRequired')),
    notes: z.string().optional(),
  }), [t]);

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
      groupId: '',
      gender: 'male' as const,
      nationality: 'السعودية',
    },
  });

  const [groupOptions, setGroupOptions] = useState<{ value: string; label: string }[]>(
    pilgrim?.groupId && pilgrim?.groupName
      ? [{ value: pilgrim.groupId, label: pilgrim.groupName }]
      : []
  );
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadGroups = async () => {
      try {
        setIsLoadingGroups(true);
        const response = await groupAPI.getAll();
        const agencies = Array.isArray(response) ? response : [];
        if (!isMounted) return;
        const options = agencies.map((agency: any) => ({
          value: String(agency.id),
          label: agency.name,
        }));
        if (pilgrim?.groupId && pilgrim?.groupName && !options.some((opt) => opt.value === pilgrim.groupId)) {
          options.push({ value: pilgrim.groupId, label: pilgrim.groupName });
        }
        setGroupOptions(options);
      } catch (error) {
        console.error('Failed to load groups', error);
      } finally {
        if (isMounted) {
          setIsLoadingGroups(false);
        }
      }
    };

    loadGroups();

    return () => {
      isMounted = false;
    };
  }, [pilgrim?.groupId, pilgrim?.groupName]);

  // Get nationality options from the comprehensive list
  const nationalityOptions = getNationalityOptions();

  const onFormSubmit = async (data: PilgrimFormData) => {
    const formData: any = {
      ...data,
      age: parseInt(data.age), // Convert age string to number
      hasSpecialNeeds: !!data.specialNeedsType && data.specialNeedsType !== '' && data.specialNeedsType !== '__placeholder__', // Set based on whether disability type is selected
    };

    if (!formData.passportNumber) {
      delete formData.passportNumber;
    }

    // Clean up empty values and placeholder
    if (!formData.specialNeedsType || formData.specialNeedsType === '' || formData.specialNeedsType === '__placeholder__') {
      delete formData.specialNeedsType;
      delete formData.specialNeedsNotes;
      formData.hasSpecialNeeds = false;
    }

    if (!formData.notes) {
      delete formData.notes;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('pilgrims.form.basicInfo')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationalId">
              {t('pilgrims.form.nationalId')} *
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
              {t('pilgrims.form.passportNumber')}
            </Label>
            <Input
              id="passportNumber"
              {...register('passportNumber')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">
              {t('pilgrims.form.nationality')} *
            </Label>
            <SearchableSelect
              value={watch('nationality') || ''}
              onValueChange={(value) => setValue('nationality', value)}
              options={nationalityOptions}
              placeholder={t('pilgrims.form.selectNationality')}
              searchPlaceholder={t('pilgrims.form.searchNationalities')}
              noResultsText={t('pilgrims.form.noResultsFound')}
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
              {t('pilgrims.form.phoneNumber')} *
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
              {t('pilgrims.form.group')} *
            </Label>
            <SearchableSelect
              value={watch('groupId') || ''}
              onValueChange={(value) => setValue('groupId', value, { shouldValidate: true })}
              options={groupOptions}
              placeholder={t('pilgrims.form.selectGroup')}
              searchPlaceholder={t('pilgrims.form.searchGroups')}
              noResultsText={t('pilgrims.form.noResultsFound')}
              clearable={false}
              isRTL={isRTL}
              disabled={isLoadingGroups}
            />
            {errors.groupId && (
              <p className="text-sm text-red-500">{errors.groupId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNeedsType">
              {t('pilgrims.form.disabilityType')}
            </Label>
            <Select
              value={watch('specialNeedsType') || ''}
              onValueChange={(value) => setValue('specialNeedsType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('pilgrims.form.selectDisabilityType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" disabled>
                  {t('pilgrims.form.selectDisabilityType')}
                </SelectItem>
                <SelectItem value="mobility">
                  {t('pilgrims.form.disabilityTypes.mobility')}
                </SelectItem>
                <SelectItem value="vision_hearing">
                  {t('pilgrims.form.disabilityTypes.vision_hearing')}
                </SelectItem>
                <SelectItem value="medical_care">
                  {t('pilgrims.form.disabilityTypes.medical_care')}
                </SelectItem>
                <SelectItem value="elderly_cognitive">
                  {t('pilgrims.form.disabilityTypes.elderly_cognitive')}
                </SelectItem>
                <SelectItem value="dietary_language">
                  {t('pilgrims.form.disabilityTypes.dietary_language')}
                </SelectItem>
                <SelectItem value="other">
                  {t('pilgrims.form.disabilityTypes.other')}
                </SelectItem>
              </SelectContent>
            </Select>
            {watch('specialNeedsType') === 'other' && (
              <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                {t('pilgrims.form.disabilityOtherNote')}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('pilgrims.form.personalInfo')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              {t('pilgrims.form.firstName')} *
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
              {t('pilgrims.form.lastName')} *
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
              {t('pilgrims.form.age')} *
            </Label>
            <Input
              id="age"
              type="number"
              min="1"
              {...register('age')}
              placeholder={t('pilgrims.form.enterAge')}
              className={cn(errors.age && 'border-red-500')}
            />
            {errors.age && (
              <p className="text-sm text-red-500">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              {t('pilgrims.form.gender')} *
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
                  {t('pilgrims.form.male')}
                </SelectItem>
                <SelectItem value="female">
                  {t('pilgrims.form.female')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('pilgrims.form.additionalInfo')}
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">
              {t('pilgrims.form.notes')}
            </Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('pilgrims.form.additionalNotes')}
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
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
          {isEdit ? t('common.saveChanges') : t('pilgrims.form.addPilgrim')}
        </Button>
      </div>
    </form>
  );
}
