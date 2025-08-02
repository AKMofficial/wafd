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
import { generateMockPilgrims } from '@/lib/mock-data';

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

const allPilgrims = generateMockPilgrims(150);

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
          await new Promise(resolve => setTimeout(resolve, 500));
          
          let filtered = [...allPilgrims];
          
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(p => 
              p.fullName.toLowerCase().includes(searchLower) ||
              p.registrationNumber.toLowerCase().includes(searchLower) ||
              p.nationalId.includes(searchLower) ||
              p.phoneNumber.includes(searchLower)
            );
          }
          
          if (filters.status && filters.status.length > 0) {
            filtered = filtered.filter(p => filters.status!.includes(p.status));
          }
          
          if (filters.gender) {
            filtered = filtered.filter(p => p.gender === filters.gender);
          }
          
          if (filters.hasSpecialNeeds !== undefined) {
            filtered = filtered.filter(p => p.hasSpecialNeeds === filters.hasSpecialNeeds);
          }
          
          if (filters.hall) {
            filtered = filtered.filter(p => p.assignedHall === filters.hall);
          }
          
          if (filters.group) {
            filtered = filtered.filter(p => p.groupId === filters.group);
          }
          
          if (filters.nationality) {
            filtered = filtered.filter(p => p.nationality === filters.nationality);
          }
          
          if (filters.ageRange) {
            if (filters.ageRange.min !== undefined) {
              filtered = filtered.filter(p => p.age >= filters.ageRange!.min!);
            }
            if (filters.ageRange.max !== undefined) {
              filtered = filtered.filter(p => p.age <= filters.ageRange!.max!);
            }
          }
          
          if (pagination.sortBy) {
            filtered.sort((a, b) => {
              const aVal = a[pagination.sortBy!];
              const bVal = b[pagination.sortBy!];
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
          set({ error: 'فشل في تحميل البيانات', isLoading: false });
          throw error;
        }
      },
      
      fetchPilgrimById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const pilgrim = allPilgrims.find(p => p.id === id) || null;
          set({ selectedPilgrim: pilgrim, isLoading: false });
          return pilgrim;
        } catch (error) {
          set({ error: 'فشل في تحميل بيانات الحاج', isLoading: false });
          return null;
        }
      },
      
      createPilgrim: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newPilgrim: Pilgrim = {
            id: (allPilgrims.length + 1).toString(),
            ...data,
            fullName: `${data.firstName} ${data.lastName}`,
            age: new Date().getFullYear() - new Date(data.birthDate).getFullYear(),
            status: 'expected',
            hasSpecialNeeds: data.hasSpecialNeeds || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          allPilgrims.push(newPilgrim);
          set({ isLoading: false });
          return newPilgrim;
        } catch (error) {
          set({ error: 'فشل في إضافة الحاج', isLoading: false });
          throw error;
        }
      },
      
      updatePilgrim: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const index = allPilgrims.findIndex(p => p.id === id);
          if (index === -1) throw new Error('لم يتم العثور على الحاج');
          
          const updated = {
            ...allPilgrims[index],
            ...data,
            fullName: data.firstName && data.lastName 
              ? `${data.firstName} ${data.lastName}`
              : allPilgrims[index].fullName,
            age: data.birthDate 
              ? new Date().getFullYear() - new Date(data.birthDate).getFullYear()
              : allPilgrims[index].age,
            updatedAt: new Date(),
          };
          
          allPilgrims[index] = updated;
          set({ isLoading: false });
          return updated;
        } catch (error) {
          set({ error: 'فشل في تحديث بيانات الحاج', isLoading: false });
          throw error;
        }
      },
      
      deletePilgrim: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const index = allPilgrims.findIndex(p => p.id === id);
          if (index === -1) throw new Error('لم يتم العثور على الحاج');
          
          allPilgrims.splice(index, 1);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ error: 'فشل في حذف الحاج', isLoading: false });
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
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            success: true,
            totalRecords: 50,
            importedCount: 48,
            failedCount: 2,
            errors: [
              { row: 15, field: 'nationalId', value: '', message: 'رقم الهوية مطلوب' },
              { row: 23, field: 'birthDate', value: '32/13/2000', message: 'تاريخ غير صالح' }
            ],
            duplicates: ['HAJ2024010', 'HAJ2024025']
          };
        } catch (error) {
          set({ error: 'فشل في استيراد الملف', isLoading: false });
          throw error;
        }
      },
      
      getStatistics: () => {
        const stats: PilgrimStatistics = {
          total: allPilgrims.length,
          arrived: allPilgrims.filter(p => p.status === 'arrived').length,
          expected: allPilgrims.filter(p => p.status === 'expected').length,
          departed: allPilgrims.filter(p => p.status === 'departed').length,
          noShow: allPilgrims.filter(p => p.status === 'no_show').length,
          specialNeeds: allPilgrims.filter(p => p.hasSpecialNeeds).length,
          maleCount: allPilgrims.filter(p => p.gender === 'male').length,
          femaleCount: allPilgrims.filter(p => p.gender === 'female').length,
          occupancyRate: (allPilgrims.filter(p => p.status === 'arrived').length / allPilgrims.length) * 100,
          byNationality: allPilgrims.reduce((acc, p) => {
            acc[p.nationality] = (acc[p.nationality] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byAgeGroup: allPilgrims.reduce((acc, p) => {
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