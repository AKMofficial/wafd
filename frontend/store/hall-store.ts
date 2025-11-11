import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as Y from 'yjs';
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
import { hallAPI, bedAPI } from '@/lib/api';
import {
  transformHallsFromBackend,
  transformHallFromBackend,
  mapBedStatusToBackend,
} from '@/lib/transformers/hall';

interface HallPaginationParams {
  page: number;
  limit: number;
  sortBy?: keyof Hall;
  sortOrder?: 'asc' | 'desc';
}

interface HallState {
  halls: Hall[];
  allHalls: Hall[];
  selectedHall: Hall | null;
  filters: HallFilters;
  bedFilters: BedFilters;
  pagination: HallPaginationParams;
  isLoading: boolean;
  error: string | null;
  
  // Yjs integration
  ydoc: Y.Doc | null;
  yhalls: Y.Map<any> | null;
  
  // Initialize Yjs
  initYjs: (doc: Y.Doc) => void;

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
  sortOrder: 'asc',
};

const applyHallFilters = (halls: Hall[], filters: HallFilters): Hall[] => {
  let filtered = [...halls];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (h) =>
        h.name.toLowerCase().includes(searchLower) ||
        h.code.toLowerCase().includes(searchLower),
    );
  }

  if (filters.type) {
    filtered = filtered.filter((h) => h.type === filters.type);
  }

  if (filters.hasAvailableBeds !== undefined) {
    filtered = filtered.filter((h) =>
      filters.hasAvailableBeds ? h.availableBeds > 0 : h.availableBeds === 0,
    );
  }

  if (filters.hasSpecialNeeds !== undefined) {
    filtered = filtered.filter((h) =>
      filters.hasSpecialNeeds ? h.specialNeedsOccupancy > 0 : h.specialNeedsOccupancy === 0,
    );
  }

  if (filters.minOccupancy !== undefined) {
    filtered = filtered.filter((h) =>
      h.capacity > 0 && h.currentOccupancy / h.capacity * 100 >= filters.minOccupancy!,
    );
  }

  if (filters.maxOccupancy !== undefined) {
    filtered = filtered.filter((h) =>
      h.capacity > 0 && h.currentOccupancy / h.capacity * 100 <= filters.maxOccupancy!,
    );
  }

  return filtered;
};

const sortHalls = (
  halls: Hall[],
  sortBy?: keyof Hall,
  sortOrder: 'asc' | 'desc' = 'asc',
): Hall[] => {
  if (!sortBy) {
    return halls;
  }

  return [...halls].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortOrder === 'asc' ? -1 : 1;
    if (bVal == null) return sortOrder === 'asc' ? 1 : -1;

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

const applyBedFilters = (beds: Bed[], filters: BedFilters): Bed[] => {
  let filtered = [...beds];

  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((b) => filters.status!.includes(b.status));
  }

  if (filters.isSpecialNeeds !== undefined) {
    filtered = filtered.filter((b) => b.isSpecialNeeds === filters.isSpecialNeeds);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((b) => b.number.toLowerCase().includes(searchLower));
  }

  return filtered;
};

const generateBedNumber = (hallCode: string, index: number, config = DEFAULT_NUMBERING_CONFIG.male) => {
  const num = config.startNumber + index;
  const padded = config.padding > 0 ? num.toString().padStart(config.padding, '0') : num.toString();
  return `${config.prefix ?? ''}${hallCode}${config.separator}${padded}${config.suffix ?? ''}`;
};


export const useHallStore = create<HallState>()(
  devtools((set, get) => {
    const recomputeVisibleHalls = (allHalls: Hall[]): PaginatedHallsResponse<Hall> => {
      const { filters, pagination } = get();
      const filtered = sortHalls(
        applyHallFilters(allHalls, filters),
        pagination.sortBy,
        pagination.sortOrder,
      );

      const total = filtered.length;
      const start = (pagination.page - 1) * pagination.limit;
      const end = start + pagination.limit;
      const data = filtered.slice(start, end);
      const totalPages = pagination.limit > 0 ? Math.max(1, Math.ceil(total / pagination.limit)) : 1;

      set({ halls: data, allHalls });

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
        hasNext: end < total,
        hasPrevious: pagination.page > 1,
      };
    };

    const updateHallInState = (updatedHall: Hall) => {
      const allHalls = [...get().allHalls];
      const index = allHalls.findIndex((h) => h.id === updatedHall.id);
      if (index === -1) return;
      allHalls[index] = updatedHall;
      recomputeVisibleHalls(allHalls);
    };

    return {
      halls: [],
      allHalls: [],
      selectedHall: null,
      filters: initialFilters,
      bedFilters: initialBedFilters,
      pagination: initialPagination,
      isLoading: false,
      error: null,
      ydoc: null,
      yhalls: null,
      
      initYjs: (doc: Y.Doc) => {
        const yhalls = doc.getMap('halls');
        
        // Sync Yjs changes to Zustand
        yhalls.observe(() => {
          const halls: Hall[] = [];
          yhalls.forEach((value) => {
            try {
              if (value) {
                const hallStr = typeof value === 'string' ? value : JSON.stringify(value);
                const parsed = JSON.parse(hallStr);
                if (parsed && parsed.id) {
                  halls.push(parsed);
                }
              }
            } catch (error) {
              console.error('[Yjs] Failed to parse hall data:', error);
            }
          });
          if (halls.length > 0) {
            recomputeVisibleHalls(halls);
          }
        });
        
        // Initialize Yjs with current halls (only if we have data)
        const currentHalls = get().allHalls;
        if (currentHalls && currentHalls.length > 0) {
          currentHalls.forEach(hall => {
            if (hall && hall.id) {
              try {
                yhalls.set(hall.id, JSON.stringify(hall));
              } catch (error) {
                console.error('[Yjs] Failed to set hall in Yjs:', error);
              }
            }
          });
        }
        
        set({ ydoc: doc, yhalls });
      },

      setHalls: (halls) => {
        const { yhalls } = get();
        if (yhalls) {
          // Update Yjs map (will trigger observe callback)
          halls.forEach(hall => {
            yhalls.set(hall.id, JSON.stringify(hall));
          });
        } else {
          // Fallback to local state
          recomputeVisibleHalls(halls);
        }
      },

      setSelectedHall: (hall) => set({ selectedHall: hall }),

      setFilters: (filters) => {
        set({ filters, pagination: { ...get().pagination, page: 1 } });
        const current = get().allHalls;
        if (current.length > 0) {
          recomputeVisibleHalls(current);
        }
      },

      setBedFilters: (filters) => set({ bedFilters: filters }),

      setPagination: (pagination) => {
        set({ pagination: { ...get().pagination, ...pagination } });
        const current = get().allHalls;
        if (current.length > 0) {
          recomputeVisibleHalls(current);
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      fetchHalls: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await hallAPI.getAll();
          const backendHalls = Array.isArray(response) ? response : [];
          const transformed = transformHallsFromBackend(backendHalls);
          const result = recomputeVisibleHalls(transformed);
          set({ isLoading: false });
          return result;
        } catch (error) {
          console.error('Failed to load halls:', error);
          set({ error: 'errors.failedToLoadHalls', isLoading: false });
          throw error;
        }
      },

      fetchHallById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await hallAPI.getById(parseInt(id, 10));
          const hall = response ? transformHallFromBackend(response) : null;
          set({ selectedHall: hall, isLoading: false });
          return hall;
        } catch (error) {
          console.error('Failed to fetch hall:', error);
          const fallback = get().allHalls.find((h) => h.id === id) || null;
          set({ selectedHall: fallback, isLoading: false });
          return fallback;
        }
      },

      createHall: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await hallAPI.create(data);
          await get().fetchHalls();
          const created = get().allHalls.find((h) => h.code === data.code) || null;
          set({ isLoading: false });
          
          if (created) {
            // Sync to Yjs
            const { yhalls } = get();
            if (yhalls) {
              yhalls.set(created.id, JSON.stringify(created));
            }
            return created;
          }

          const config = data.numberingConfig || DEFAULT_NUMBERING_CONFIG[data.type];
          const beds: Bed[] = Array.from({ length: data.capacity }, (_, idx) => ({
            id: `temp-${data.code}-${idx}`,
            number: generateBedNumber(data.code, idx, config),
            hallId: 'temp',
            hallCode: data.code,
            status: 'vacant',
            isSpecialNeeds: false,
          }));

          const tempHall: Hall = {
            id: `temp-${Date.now()}`,
            name: data.name,
            code: data.code,
            type: data.type,
            capacity: data.capacity,
            currentOccupancy: 0,
            availableBeds: data.capacity,
            specialNeedsOccupancy: 0,
            beds,
            numberingFormat: data.numberingFormat ?? 'standard',
            numberingConfig: data.numberingConfig,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          // Sync to Yjs
          const { yhalls } = get();
          if (yhalls) {
            yhalls.set(tempHall.id, JSON.stringify(tempHall));
          }
          
          return tempHall;
        } catch (error) {
          console.error('Failed to create hall:', error);
          set({ error: 'errors.failedToCreateHall', isLoading: false });
          throw error;
        }
      },

      updateHall: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          await hallAPI.update(parseInt(id, 10), data);
          await get().fetchHalls();
          const updated = get().allHalls.find((h) => h.id === id) || null;
          set({ isLoading: false });
          
          const result = updated ?? {
            id,
            name: data.name ?? '',
            code: data.code ?? '',
            type: data.type ?? 'male',
            capacity: data.capacity ?? 0,
            currentOccupancy: 0,
            availableBeds: data.capacity ?? 0,
            specialNeedsOccupancy: 0,
            beds: [],
            numberingFormat: data.numberingFormat ?? 'standard',
            numberingConfig: data.numberingConfig,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          // Sync to Yjs
          const { yhalls } = get();
          if (yhalls) {
            yhalls.set(id, JSON.stringify(result));
          }
          
          return result;
        } catch (error) {
          console.error('Failed to update hall:', error);
          set({ error: 'errors.failedToUpdateHall', isLoading: false });
          throw error;
        }
      },

      deleteHall: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await hallAPI.delete(parseInt(id, 10));
          
          // Remove from Yjs
          const { yhalls } = get();
          if (yhalls) {
            yhalls.delete(id);
          }
          
          await get().fetchHalls();
          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Failed to delete hall:', error);
          set({ error: 'errors.failedToDeleteHall', isLoading: false });
          return false;
        }
      },

      assignBed: async ({ pilgrimId, bedId }) => {
        await bedAPI.assignBed(parseInt(pilgrimId, 10), parseInt(bedId, 10));

        const selectedHall = get().selectedHall;
        if (selectedHall) {
          await get().fetchHallById(selectedHall.id);
        }

        await get().fetchHalls();

        const halls = get().allHalls;
        let assignedBed: Bed | null = null;

        halls.forEach((hall) => {
          const bed = hall.beds.find((b) => b.id === bedId);
          if (bed) {
            assignedBed = bed;
          }
        });

        if (!assignedBed) {
          assignedBed = {
            id: bedId,
            number: bedId,
            hallId: '',
            hallCode: '',
            status: 'occupied',
            pilgrimId,
            isSpecialNeeds: false,
            lastAssignedAt: new Date(),
          };
        }

        return assignedBed;
      },

      vacateBed: async (bedId) => {
        await bedAPI.vacateBed(parseInt(bedId, 10));

        const selectedHall = get().selectedHall;
        if (selectedHall) {
          await get().fetchHallById(selectedHall.id);
        }

        await get().fetchHalls();

        const halls = get().allHalls;
        let vacatedBed: Bed | null = null;

        halls.forEach((hall) => {
          const bed = hall.beds.find((b) => b.id === bedId);
          if (bed) {
            vacatedBed = bed;
          }
        });

        if (!vacatedBed) {
          vacatedBed = {
            id: bedId,
            number: bedId,
            hallId: '',
            hallCode: '',
            status: 'vacant',
            isSpecialNeeds: false,
            lastVacatedAt: new Date(),
          };
        }

        return vacatedBed;
      },

      transferBed: async ({ pilgrimId, fromBedId, toBedId }) => {
        await get().vacateBed(fromBedId);
        const assigned = await get().assignBed({ pilgrimId, bedId: toBedId });
        const vacated = get()
          .allHalls.flatMap((h) => h.beds)
          .find((bed) => bed.id === fromBedId);

        if (!vacated) {
          throw new Error('errors.bedNotFound');
        }

        return { fromBed: vacated, toBed: assigned };
      },

      updateBedStatus: async (bedId, status, notes) => {
        try {
          await bedAPI.updateBedStatus(parseInt(bedId, 10), mapBedStatusToBackend(status));
        } catch (error) {
          console.warn('Backend bed status update failed, falling back to local update.', error);
        }

        const selectedHall = get().selectedHall;
        let updated: Bed | null = null;

        if (selectedHall) {
          const updatedBeds = selectedHall.beds.map((bed) => {
            if (bed.id === bedId) {
              updated = {
                ...bed,
                status,
                maintenanceNotes: notes,
              };
              return updated;
            }
            return bed;
          });

          const updatedSelectedHall = {
            ...selectedHall,
            beds: updatedBeds,
          };
          set({ selectedHall: updatedSelectedHall });

          const halls = get().allHalls.map((hall) => {
            if (hall.id === selectedHall.id) {
              return updatedSelectedHall;
            }
            return hall;
          });

          recomputeVisibleHalls(halls);
        } else {
          const halls = [...get().allHalls];

          halls.forEach((hall) => {
            hall.beds = hall.beds.map((bed) => {
              if (bed.id === bedId) {
                updated = {
                  ...bed,
                  status,
                  maintenanceNotes: notes,
                };
                return updated;
              }
              return bed;
            });
          });

          recomputeVisibleHalls(halls);
        }

        if (!updated) {
          throw new Error('errors.bedNotFound');
        }

        return updated;
      },

      getStatistics: () => {
        const halls = get().allHalls;
        if (halls.length === 0) {
          return {
            totalHalls: 0,
            totalBeds: 0,
            totalOccupied: 0,
            totalAvailable: 0,
            totalMaintenance: 0,
            totalReserved: 0,
            occupancyRate: 0,
            maleHalls: { count: 0, beds: 0, occupied: 0, occupancyRate: 0 },
            femaleHalls: { count: 0, beds: 0, occupied: 0, occupancyRate: 0 },
            specialNeedsOccupied: 0,
            byHall: {},
          };
        }

        const stats: HallStatistics = {
          totalHalls: halls.length,
          totalBeds: 0,
          totalOccupied: 0,
          totalAvailable: 0,
          totalMaintenance: 0,
          totalReserved: 0,
          occupancyRate: 0,
          maleHalls: { count: 0, beds: 0, occupied: 0, occupancyRate: 0 },
          femaleHalls: { count: 0, beds: 0, occupied: 0, occupancyRate: 0 },
          specialNeedsOccupied: 0,
          byHall: {},
        };

        halls.forEach((hall) => {
          stats.totalBeds += hall.capacity;
          stats.totalOccupied += hall.currentOccupancy;
          stats.totalAvailable += hall.availableBeds;
          stats.specialNeedsOccupied += hall.specialNeedsOccupancy;

          const maintenanceBeds = hall.beds.filter((bed) => bed.status === 'maintenance').length;
          const reservedBeds = hall.beds.filter((bed) => bed.status === 'reserved').length;
          stats.totalMaintenance += maintenanceBeds;
          stats.totalReserved += reservedBeds;

          if (hall.type === 'male') {
            stats.maleHalls.count += 1;
            stats.maleHalls.beds += hall.capacity;
            stats.maleHalls.occupied += hall.currentOccupancy;
          } else {
            stats.femaleHalls.count += 1;
            stats.femaleHalls.beds += hall.capacity;
            stats.femaleHalls.occupied += hall.currentOccupancy;
          }

          stats.byHall[hall.id] = {
            name: hall.name,
            occupancy: hall.currentOccupancy,
            capacity: hall.capacity,
            rate: hall.capacity > 0 ? (hall.currentOccupancy / hall.capacity) * 100 : 0,
          };
        });

        stats.occupancyRate = stats.totalBeds > 0 ? (stats.totalOccupied / stats.totalBeds) * 100 : 0;
        stats.maleHalls.occupancyRate = stats.maleHalls.beds > 0 ? (stats.maleHalls.occupied / stats.maleHalls.beds) * 100 : 0;
        stats.femaleHalls.occupancyRate = stats.femaleHalls.beds > 0 ? (stats.femaleHalls.occupied / stats.femaleHalls.beds) * 100 : 0;

        return stats;
      },

      getHallOccupancy: (hallId) => {
        const hall = get().allHalls.find((h) => h.id === hallId);
        if (!hall) {
          return { occupied: 0, available: 0, rate: 0 };
        }

        return {
          occupied: hall.currentOccupancy,
          available: hall.availableBeds,
          rate: hall.capacity > 0 ? (hall.currentOccupancy / hall.capacity) * 100 : 0,
        };
      },

      getAvailableBeds: (hallId, filters) => {
        let hall = get().allHalls.find((h) => h.id === hallId);
        if (!hall) {
          const selectedHall = get().selectedHall;
          hall = selectedHall?.id === hallId ? selectedHall : undefined;
        }
        if (!hall) {
          return [];
        }

        return applyBedFilters(
          hall.beds,
          filters ?? get().bedFilters,
        );
      },

      refreshOccupancy: () => {
        const halls = get().allHalls.map((hall) => {
          const occupied = hall.beds.filter((bed) => bed.status === 'occupied').length;
          const specialNeeds = hall.beds.filter((bed) => bed.isSpecialNeeds && bed.status === 'occupied').length;

          return {
            ...hall,
            currentOccupancy: occupied,
            availableBeds: hall.capacity - occupied,
            specialNeedsOccupancy: specialNeeds,
          };
        });

        recomputeVisibleHalls(halls);
      },

      resetFilters: () => {
        set({ filters: initialFilters, bedFilters: initialBedFilters, pagination: initialPagination });
        const current = get().allHalls;
        if (current.length > 0) {
          recomputeVisibleHalls(current);
        }
      },
    };
  }, { name: 'hall-store' }),
);



