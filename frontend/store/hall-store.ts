import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Hall,
  Bed,
  HallFilters,
  BedFilters,
  CreateHallDto,
  UpdateHallDto,
  HallStatistics,
  BedAssignmentDto,
  BedTransferDto,
  PaginatedHallsResponse,
  DEFAULT_NUMBERING_CONFIG,
} from '@/types/hall';
import { PaginationParams } from '@/types/pilgrim';

// Hall-specific pagination params
interface HallPaginationParams {
  page: number;
  limit: number;
  sortBy?: keyof Hall;
  sortOrder?: 'asc' | 'desc';
}
import { generateMockHalls } from '@/lib/mock-halls';

interface HallState {
  halls: Hall[];
  selectedHall: Hall | null;
  filters: HallFilters;
  bedFilters: BedFilters;
  pagination: HallPaginationParams;
  isLoading: boolean;
  error: string | null;

  setHalls: (halls: Hall[]) => void;
  setSelectedHall: (hall: Hall | null) => void;
  setFilters: (filters: HallFilters) => void;
  setBedFilters: (filters: BedFilters) => void;
  setPagination: (pagination: Partial<HallPaginationParams>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  fetchHalls: () => Promise<PaginatedHallsResponse<Hall>>;
  fetchHallById: (id: string) => Promise<Hall | null>;
  createHall: (data: CreateHallDto) => Promise<Hall>;
  updateHall: (id: string, data: UpdateHallDto) => Promise<Hall>;
  deleteHall: (id: string) => Promise<boolean>;
  
  assignBed: (data: BedAssignmentDto) => Promise<Bed>;
  vacateBed: (bedId: string) => Promise<Bed>;
  transferBed: (data: BedTransferDto) => Promise<{ fromBed: Bed; toBed: Bed }>;
  updateBedStatus: (bedId: string, status: Bed['status'], notes?: string) => Promise<Bed>;
  
  getStatistics: () => HallStatistics;
  getHallOccupancy: (hallId: string) => { occupied: number; available: number; rate: number };
  getAvailableBeds: (hallId: string, filters?: BedFilters) => Bed[];
  
  refreshOccupancy: () => void;
  resetFilters: () => void;
}

const initialFilters: HallFilters = {};
const initialBedFilters: BedFilters = {};
const initialPagination: HallPaginationParams = {
  page: 1,
  limit: 12,
  sortBy: 'name',
  sortOrder: 'asc'
};

const allHalls = generateMockHalls();

export const useHallStore = create<HallState>()(
  devtools(
    (set, get) => ({
      halls: [],
      selectedHall: null,
      filters: initialFilters,
      bedFilters: initialBedFilters,
      pagination: initialPagination,
      isLoading: false,
      error: null,

      setHalls: (halls) => set({ halls }),
      setSelectedHall: (hall) => set({ selectedHall: hall }),
      setFilters: (filters) => set({ filters, pagination: { ...get().pagination, page: 1 } }),
      setBedFilters: (filters) => set({ bedFilters: filters }),
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      fetchHalls: async () => {
        const { filters, pagination } = get();
        set({ isLoading: true, error: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          let filtered = [...allHalls];

          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(h =>
              h.name.toLowerCase().includes(searchLower) ||
              h.code.toLowerCase().includes(searchLower)
            );
          }

          if (filters.type) {
            filtered = filtered.filter(h => h.type === filters.type);
          }

          if (filters.hasAvailableBeds !== undefined) {
            filtered = filtered.filter(h => 
              filters.hasAvailableBeds ? h.availableBeds > 0 : h.availableBeds === 0
            );
          }

          if (filters.minOccupancy !== undefined) {
            filtered = filtered.filter(h => 
              (h.currentOccupancy / h.capacity * 100) >= filters.minOccupancy!
            );
          }

          if (filters.maxOccupancy !== undefined) {
            filtered = filtered.filter(h => 
              (h.currentOccupancy / h.capacity * 100) <= filters.maxOccupancy!
            );
          }

          if (pagination.sortBy) {
            filtered.sort((a, b) => {
              const aVal = a[pagination.sortBy as keyof Hall];
              const bVal = b[pagination.sortBy as keyof Hall];
              
              // Handle undefined values
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

          set({ halls: paginatedData, isLoading: false });

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
          set({ error: 'فشل في تحميل القاعات', isLoading: false });
          throw error;
        }
      },

      fetchHallById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const hall = allHalls.find(h => h.id === id) || null;
          set({ selectedHall: hall, isLoading: false });
          return hall;
        } catch (error) {
          set({ error: 'فشل في تحميل بيانات القاعة', isLoading: false });
          return null;
        }
      },

      createHall: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const beds: Bed[] = [];
          const config = data.numberingConfig || DEFAULT_NUMBERING_CONFIG[data.type];
          
          for (let i = 0; i < data.capacity; i++) {
            const bedNumber = generateBedNumber(data.code, i, config);
            beds.push({
              id: `${data.code}-bed-${i + 1}`,
              number: bedNumber,
              hallId: (allHalls.length + 1).toString(),
              hallCode: data.code,
              status: 'vacant',
              isSpecialNeeds: false,
            });
          }

          const newHall: Hall = {
            id: (allHalls.length + 1).toString(),
            ...data,
            currentOccupancy: 0,
            availableBeds: data.capacity,
            specialNeedsOccupancy: 0,
            beds,
            numberingFormat: data.numberingFormat || 'standard',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          allHalls.push(newHall);
          set({ isLoading: false });
          return newHall;
        } catch (error) {
          set({ error: 'فشل في إنشاء القاعة', isLoading: false });
          throw error;
        }
      },

      updateHall: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const index = allHalls.findIndex(h => h.id === id);
          if (index === -1) throw new Error('لم يتم العثور على القاعة');

          const updated = {
            ...allHalls[index],
            ...data,
            updatedAt: new Date(),
          };

          allHalls[index] = updated;
          set({ isLoading: false });
          return updated;
        } catch (error) {
          set({ error: 'فشل في تحديث القاعة', isLoading: false });
          throw error;
        }
      },

      deleteHall: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const index = allHalls.findIndex(h => h.id === id);
          if (index === -1) throw new Error('لم يتم العثور على القاعة');

          if (allHalls[index].currentOccupancy > 0) {
            throw new Error('لا يمكن حذف قاعة بها نزلاء');
          }

          allHalls.splice(index, 1);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'فشل في حذف القاعة', isLoading: false });
          return false;
        }
      },

      assignBed: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          const hall = allHalls.find(h => h.beds.some(b => b.id === data.bedId));
          if (!hall) throw new Error('لم يتم العثور على السرير');

          const bedIndex = hall.beds.findIndex(b => b.id === data.bedId);
          if (bedIndex === -1) throw new Error('لم يتم العثور على السرير');

          if (hall.beds[bedIndex].status !== 'vacant') {
            throw new Error('السرير غير متاح');
          }

          hall.beds[bedIndex] = {
            ...hall.beds[bedIndex],
            status: 'occupied',
            pilgrimId: data.pilgrimId,
            isSpecialNeeds: data.isSpecialNeeds || false,
            lastAssignedAt: new Date(),
          };

          hall.currentOccupancy++;
          hall.availableBeds--;
          if (data.isSpecialNeeds) {
            hall.specialNeedsOccupancy++;
          }

          set({ isLoading: false });
          return hall.beds[bedIndex];
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'فشل في تخصيص السرير', isLoading: false });
          throw error;
        }
      },

      vacateBed: async (bedId) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          const hall = allHalls.find(h => h.beds.some(b => b.id === bedId));
          if (!hall) throw new Error('لم يتم العثور على السرير');

          const bedIndex = hall.beds.findIndex(b => b.id === bedId);
          if (bedIndex === -1) throw new Error('لم يتم العثور على السرير');

          const bed = hall.beds[bedIndex];
          if (bed.status !== 'occupied') {
            throw new Error('السرير غير مشغول');
          }

          hall.beds[bedIndex] = {
            ...bed,
            status: 'vacant',
            pilgrimId: undefined,
            lastVacatedAt: new Date(),
          };

          hall.currentOccupancy--;
          hall.availableBeds++;
          if (bed.isSpecialNeeds) {
            hall.specialNeedsOccupancy--;
          }

          set({ isLoading: false });
          return hall.beds[bedIndex];
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'فشل في إخلاء السرير', isLoading: false });
          throw error;
        }
      },

      transferBed: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const fromBed = await get().vacateBed(data.fromBedId);
          const toBed = await get().assignBed({
            pilgrimId: data.pilgrimId,
            bedId: data.toBedId,
            isSpecialNeeds: fromBed.isSpecialNeeds,
          });

          set({ isLoading: false });
          return { fromBed, toBed };
        } catch (error) {
          set({ error: 'فشل في نقل السرير', isLoading: false });
          throw error;
        }
      },

      updateBedStatus: async (bedId, status, notes) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));

          const hall = allHalls.find(h => h.beds.some(b => b.id === bedId));
          if (!hall) throw new Error('لم يتم العثور على السرير');

          const bedIndex = hall.beds.findIndex(b => b.id === bedId);
          if (bedIndex === -1) throw new Error('لم يتم العثور على السرير');

          hall.beds[bedIndex] = {
            ...hall.beds[bedIndex],
            status,
            maintenanceNotes: notes,
          };

          set({ isLoading: false });
          return hall.beds[bedIndex];
        } catch (error) {
          set({ error: 'فشل في تحديث حالة السرير', isLoading: false });
          throw error;
        }
      },

      getStatistics: () => {
        const stats: HallStatistics = {
          totalHalls: allHalls.length,
          totalBeds: allHalls.reduce((sum, h) => sum + h.capacity, 0),
          totalOccupied: allHalls.reduce((sum, h) => sum + h.currentOccupancy, 0),
          totalAvailable: allHalls.reduce((sum, h) => sum + h.availableBeds, 0),
          totalMaintenance: allHalls.reduce((sum, h) => 
            sum + h.beds.filter(b => b.status === 'maintenance').length, 0
          ),
          totalReserved: allHalls.reduce((sum, h) => 
            sum + h.beds.filter(b => b.status === 'reserved').length, 0
          ),
          occupancyRate: 0,
          maleHalls: {
            count: allHalls.filter(h => h.type === 'male').length,
            beds: allHalls.filter(h => h.type === 'male').reduce((sum, h) => sum + h.capacity, 0),
            occupied: allHalls.filter(h => h.type === 'male').reduce((sum, h) => sum + h.currentOccupancy, 0),
            occupancyRate: 0,
          },
          femaleHalls: {
            count: allHalls.filter(h => h.type === 'female').length,
            beds: allHalls.filter(h => h.type === 'female').reduce((sum, h) => sum + h.capacity, 0),
            occupied: allHalls.filter(h => h.type === 'female').reduce((sum, h) => sum + h.currentOccupancy, 0),
            occupancyRate: 0,
          },
          specialNeedsOccupied: allHalls.reduce((sum, h) => sum + h.specialNeedsOccupancy, 0),
          byHall: allHalls.reduce((acc, h) => {
            acc[h.id] = {
              name: h.name,
              occupancy: h.currentOccupancy,
              capacity: h.capacity,
              rate: h.capacity > 0 ? (h.currentOccupancy / h.capacity) * 100 : 0,
            };
            return acc;
          }, {} as Record<string, any>),
        };

        stats.occupancyRate = stats.totalBeds > 0 
          ? (stats.totalOccupied / stats.totalBeds) * 100 
          : 0;
        
        stats.maleHalls.occupancyRate = stats.maleHalls.beds > 0
          ? (stats.maleHalls.occupied / stats.maleHalls.beds) * 100
          : 0;
          
        stats.femaleHalls.occupancyRate = stats.femaleHalls.beds > 0
          ? (stats.femaleHalls.occupied / stats.femaleHalls.beds) * 100
          : 0;

        return stats;
      },

      getHallOccupancy: (hallId) => {
        const hall = allHalls.find(h => h.id === hallId);
        if (!hall) return { occupied: 0, available: 0, rate: 0 };

        return {
          occupied: hall.currentOccupancy,
          available: hall.availableBeds,
          rate: hall.capacity > 0 ? (hall.currentOccupancy / hall.capacity) * 100 : 0,
        };
      },

      getAvailableBeds: (hallId, filters) => {
        const hall = allHalls.find(h => h.id === hallId);
        if (!hall) return [];

        let beds = [...hall.beds];

        if (filters?.status && filters.status.length > 0) {
          beds = beds.filter(b => filters.status!.includes(b.status));
        }

        if (filters?.isSpecialNeeds !== undefined) {
          beds = beds.filter(b => b.isSpecialNeeds === filters.isSpecialNeeds);
        }

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          beds = beds.filter(b => b.number.toLowerCase().includes(searchLower));
        }

        return beds;
      },

      refreshOccupancy: () => {
        allHalls.forEach(hall => {
          const occupied = hall.beds.filter(b => b.status === 'occupied').length;
          const specialNeeds = hall.beds.filter(b => b.status === 'occupied' && b.isSpecialNeeds).length;
          
          hall.currentOccupancy = occupied;
          hall.availableBeds = hall.capacity - occupied;
          hall.specialNeedsOccupancy = specialNeeds;
        });
      },

      resetFilters: () => set({
        filters: initialFilters,
        bedFilters: initialBedFilters,
        pagination: initialPagination
      }),
    }),
    {
      name: 'hall-store',
    }
  )
);

function generateBedNumber(
  hallCode: string, 
  index: number, 
  config: any
): string {
  const num = config.startNumber + index;
  const paddedNum = config.padding > 0 
    ? num.toString().padStart(config.padding, '0')
    : num.toString();
  
  let bedNumber = '';
  if (config.prefix) bedNumber += config.prefix;
  bedNumber += hallCode;
  bedNumber += config.separator;
  bedNumber += paddedNum;
  if (config.suffix) bedNumber += config.suffix;
  
  return bedNumber;
}