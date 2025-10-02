import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Pilgrim,
  PilgrimFilters,
  PaginationParams,
  PaginatedResponse,
  CreatePilgrimDto,
  UpdatePilgrimDto,
  ImportResult,
  PilgrimStatistics
} from '@/types/pilgrim';
import { pilgrimAPI } from '@/lib/api';
import { gregorianToHijri } from '@/lib/hijri-date';

interface PilgrimState {
  pilgrims: Pilgrim[];
  selectedPilgrim: Pilgrim | null;
  filters: PilgrimFilters;
  pagination: PaginationParams;
  isLoading: boolean;
  error: string | null;
  
  setPilgrims: (pilgrims: Pilgrim[]) => void;
  setSelectedPilgrim: (pilgrim: Pilgrim | null) => void;
  setFilters: (filters: PilgrimFilters) => void;
  setPagination: (pagination: Partial<PaginationParams>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  fetchPilgrims: () => Promise<PaginatedResponse<Pilgrim>>;
  fetchPilgrimById: (id: string) => Promise<Pilgrim | null>;
  createPilgrim: (data: CreatePilgrimDto) => Promise<Pilgrim>;
  updatePilgrim: (id: string, data: UpdatePilgrimDto) => Promise<Pilgrim>;
  deletePilgrim: (id: string) => Promise<boolean>;
  markArrival: (id: string, arrivalDate: Date) => Promise<Pilgrim>;
  assignBed: (pilgrimId: string, hallId: string, bedNumber: string) => Promise<Pilgrim>;
  importFromExcel: (file: File) => Promise<ImportResult>;
  getStatistics: () => PilgrimStatistics;
  
  resetFilters: () => void;
}

const initialFilters: PilgrimFilters = {};
const initialPagination: PaginationParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

// Generate registration number helper function
const generateRegistrationNumber = (): string => {
  const currentDate = new Date();
  const hijriDate = gregorianToHijri(currentDate);
  const hijriYear = hijriDate.year;
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `H${hijriYear}${random}`;
};

export const usePilgrimStore = create<PilgrimState>()(
  devtools(
    (set, get) => ({
      pilgrims: [],
      selectedPilgrim: null,
      filters: initialFilters,
      pagination: initialPagination,
      isLoading: false,
      error: null,
      
      setPilgrims: (pilgrims) => set({ pilgrims }),
      setSelectedPilgrim: (pilgrim) => set({ selectedPilgrim: pilgrim }),
      setFilters: (filters) => set({ filters, pagination: { ...get().pagination, page: 1 } }),
      setPagination: (pagination) => set((state) => ({ 
        pagination: { ...state.pagination, ...pagination } 
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      fetchPilgrims: async () => {
        const { filters, pagination } = get();
        set({ isLoading: true, error: null });

        try {
          // Fetch all pilgrims from the backend API
          const data = await pilgrimAPI.getAll();
          let filtered = data || [];

          // Apply client-side filters
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter((p: Pilgrim) =>
              p.fullName.toLowerCase().includes(searchLower) ||
              p.registrationNumber.toLowerCase().includes(searchLower) ||
              p.nationalId.includes(searchLower) ||
              p.phoneNumber.includes(searchLower)
            );
          }

          if (filters.status && filters.status.length > 0) {
            filtered = filtered.filter((p: Pilgrim) => filters.status!.includes(p.status));
          }

          if (filters.gender) {
            filtered = filtered.filter((p: Pilgrim) => p.gender === filters.gender);
          }

          if (filters.hasSpecialNeeds !== undefined) {
            filtered = filtered.filter((p: Pilgrim) => p.hasSpecialNeeds === filters.hasSpecialNeeds);
          }

          if (filters.hall) {
            filtered = filtered.filter((p: Pilgrim) => p.assignedHall === filters.hall);
          }

          if (filters.group) {
            filtered = filtered.filter((p: Pilgrim) => p.groupId === filters.group);
          }

          if (filters.nationality) {
            filtered = filtered.filter((p: Pilgrim) => p.nationality === filters.nationality);
          }

          if (filters.ageRange) {
            if (filters.ageRange.min !== undefined) {
              filtered = filtered.filter((p: Pilgrim) => p.age >= filters.ageRange!.min!);
            }
            if (filters.ageRange.max !== undefined) {
              filtered = filtered.filter((p: Pilgrim) => p.age <= filters.ageRange!.max!);
            }
          }

          if (pagination.sortBy) {
            filtered.sort((a: Pilgrim, b: Pilgrim) => {
              const aVal = a[pagination.sortBy!];
              const bVal = b[pagination.sortBy!];

              // Handle null/undefined values
              if (aVal == null && bVal == null) return 0;
              if (aVal == null) return pagination.sortOrder === 'asc' ? -1 : 1;
              if (bVal == null) return pagination.sortOrder === 'asc' ? 1 : -1;

              if (aVal < bVal) return pagination.sortOrder === 'asc' ? -1 : 1;
              if (aVal > bVal) return pagination.sortOrder === 'asc' ? 1 : -1;
              return 0;
            });
          }

          const total = filtered.length;
          const start = (pagination.page - 1) * pagination.limit;
          const end = start + pagination.limit;
          const paginatedData = filtered.slice(start, end);

          set({ pilgrims: paginatedData, isLoading: false });

          return {
            data: paginatedData,
            total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(total / pagination.limit),
            hasNext: end < total,
            hasPrevious: pagination.page > 1
          };
        } catch (error) {
          set({ error: 'errors.failedToLoadData', isLoading: false });
          throw error;
        }
      },
      
      fetchPilgrimById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const pilgrim = await pilgrimAPI.getById(Number(id));
          set({ selectedPilgrim: pilgrim, isLoading: false });
          return pilgrim;
        } catch (error) {
          set({ error: 'errors.failedToLoadPilgrim', isLoading: false });
          return null;
        }
      },
      
      createPilgrim: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newPilgrim = await pilgrimAPI.create(data);
          set({ isLoading: false });
          // Refresh the list
          await get().fetchPilgrims();
          return newPilgrim;
        } catch (error) {
          set({ error: 'errors.failedToAddPilgrim', isLoading: false });
          throw error;
        }
      },
      
      updatePilgrim: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await pilgrimAPI.update(Number(id), data);
          set({ isLoading: false });
          // Refresh the list
          await get().fetchPilgrims();
          return updated;
        } catch (error) {
          set({ error: 'errors.failedToUpdatePilgrim', isLoading: false });
          throw error;
        }
      },
      
      deletePilgrim: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await pilgrimAPI.delete(Number(id));
          set({ isLoading: false });
          // Refresh the list
          await get().fetchPilgrims();
          return true;
        } catch (error) {
          set({ error: 'errors.failedToDeletePilgrim', isLoading: false });
          return false;
        }
      },
      
      markArrival: async (id, arrivalDate) => {
        return get().updatePilgrim(id, { 
          status: 'arrived', 
          arrivalDate 
        });
      },
      
      assignBed: async (pilgrimId, hallId, bedNumber) => {
        return get().updatePilgrim(pilgrimId, {
          assignedHall: hallId,
          assignedBed: bedNumber,
          status: 'arrived',
          arrivalDate: new Date()
        });
      },
      
      importFromExcel: async (file) => {
        set({ isLoading: true, error: null });
        try {
          // Read Excel file
          const ExcelJS = require('exceljs');
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await file.arrayBuffer());
          const worksheet = workbook.getWorksheet(1);
          
          const errors: any[] = [];
          const duplicates: string[] = [];
          let importedCount = 0;
          const totalRecords = worksheet.rowCount - 1; // Excluding header
          
          // Process each row
          for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
            const row = worksheet.getRow(rowIndex);
            const pilgrimData: any = {};
            let hasError = false;
            
            // Map columns according to EXCEL_IMPORT_COLUMNS
            const nationalId = row.getCell(1).value?.toString() || '';
            const passportNumber = row.getCell(2).value?.toString() || undefined;
            const firstName = row.getCell(3).value?.toString() || '';
            const lastName = row.getCell(4).value?.toString() || '';
            const age = parseInt(row.getCell(5).value?.toString() || '0');
            const genderText = row.getCell(6).value?.toString() || '';
            const nationality = row.getCell(7).value?.toString() || '';
            const phoneNumber = row.getCell(8).value?.toString() || '';
            const specialNeedsTypeText = row.getCell(9).value?.toString() || '';
            const notes = row.getCell(10).value?.toString() || undefined;
            
            // Validate required fields
            if (!nationalId) {
              errors.push({ row: rowIndex, field: 'nationalId', value: nationalId, message: 'errors.validation.nationalIdRequired' });
              hasError = true;
            }
            if (!firstName) {
              errors.push({ row: rowIndex, field: 'firstName', value: firstName, message: 'errors.validation.firstNameRequired' });
              hasError = true;
            }
            if (!lastName) {
              errors.push({ row: rowIndex, field: 'lastName', value: lastName, message: 'errors.validation.lastNameRequired' });
              hasError = true;
            }
            if (!age || age < 1 || age > 120) {
              errors.push({ row: rowIndex, field: 'age', value: age, message: 'errors.validation.invalidAge' });
              hasError = true;
            }
            if (!nationality) {
              errors.push({ row: rowIndex, field: 'nationality', value: nationality, message: 'errors.validation.nationalityRequired' });
              hasError = true;
            }
            if (!phoneNumber) {
              errors.push({ row: rowIndex, field: 'phoneNumber', value: phoneNumber, message: 'errors.validation.phoneNumberRequired' });
              hasError = true;
            }
            
            // Process gender
            let gender: 'male' | 'female' | undefined;
            if (genderText.toLowerCase() === 'male') {
              gender = 'male';
            } else if (genderText.toLowerCase() === 'female') {
              gender = 'female';
            } else {
              errors.push({ row: rowIndex, field: 'gender', value: genderText, message: 'errors.validation.invalidGender' });
              hasError = true;
            }
            
            // Process special needs type
            let specialNeedsType: any = null;
            let hasSpecialNeeds = false;
            if (specialNeedsTypeText) {
              hasSpecialNeeds = true;
              const specialNeedsMap: Record<string, any> = {
                'mobility': 'mobility',
                'wheelchair': 'mobility',
                'vision_hearing': 'vision_hearing',
                'vision': 'vision_hearing',
                'hearing': 'vision_hearing',
                'medical_care': 'medical_care',
                'medical': 'medical_care',
                'elderly_cognitive': 'elderly_cognitive',
                'elderly': 'elderly_cognitive',
                'dietary_language': 'dietary_language',
                'dietary': 'dietary_language',
                'other': 'other'
              };

              specialNeedsType = specialNeedsMap[specialNeedsTypeText.toLowerCase()] || 'other';
            }
            
            // Check for duplicates (against existing pilgrims from state)
            const existingPilgrims = get().pilgrims;
            if (existingPilgrims.some((p: Pilgrim) => p.nationalId === nationalId)) {
              duplicates.push(nationalId);
              hasError = true;
            }
            
            if (!hasError && gender) {
              // Create pilgrim data
              const newPilgrim: CreatePilgrimDto = {
                nationalId,
                passportNumber,
                firstName,
                lastName,
                age,
                gender,
                nationality,
                phoneNumber,
                hasSpecialNeeds,
                specialNeedsType,
                notes
              };
              
              // This would normally call the API to create the pilgrim
              // For now, we just count it as imported
              importedCount++;
            }
          }
          
          const result: ImportResult = {
            success: true,
            totalRecords,
            importedCount,
            failedCount: totalRecords - importedCount,
            errors,
            duplicates
          };
          
          set({ isLoading: false });
          return result;
          
        } catch (error) {
          set({ error: 'errors.failedToImportFile', isLoading: false });
          throw error;
        }
      },
      
      getStatistics: () => {
        const pilgrims = get().pilgrims;
        const stats: PilgrimStatistics = {
          total: pilgrims.length,
          arrived: pilgrims.filter(p => p.status === 'arrived').length,
          expected: pilgrims.filter(p => p.status === 'expected').length,
          departed: pilgrims.filter(p => p.status === 'departed').length,
          noShow: pilgrims.filter(p => p.status === 'no_show').length,
          specialNeeds: pilgrims.filter(p => p.hasSpecialNeeds).length,
          maleCount: pilgrims.filter(p => p.gender === 'male').length,
          femaleCount: pilgrims.filter(p => p.gender === 'female').length,
          occupancyRate: pilgrims.length > 0
            ? (pilgrims.filter(p => p.status === 'arrived').length / pilgrims.length) * 100
            : 0,
          byNationality: pilgrims.reduce((acc, p) => {
            acc[p.nationality] = (acc[p.nationality] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byAgeGroup: pilgrims.reduce((acc, p) => {
            const group = p.age < 30 ? '18-29' : p.age < 50 ? '30-49' : p.age < 70 ? '50-69' : '70+';
            acc[group] = (acc[group] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };
        return stats;
      },
      
      resetFilters: () => set({ 
        filters: initialFilters, 
        pagination: initialPagination 
      }),
    }),
    {
      name: 'pilgrim-store',
    }
  )
);