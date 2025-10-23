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
  PilgrimStatistics,
} from '@/types/pilgrim';
import { pilgrimAPI } from '@/lib/api';
import {
  transformPilgrimsFromBackend,
  transformPilgrimFromBackend,
} from '@/lib/transformers/pilgrim';

type SortableKey = keyof Pilgrim;

interface PilgrimState {
  pilgrims: Pilgrim[];
  allPilgrims: Pilgrim[];
  selectedPilgrim: Pilgrim | null;
  filters: PilgrimFilters;
  pagination: PaginationParams;
  isLoading: boolean;
  error: string | null;
  stats: PilgrimStatistics;

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
  assignBed: (pilgrimId: string, hallId: string, bedId: string) => Promise<Pilgrim>;
  importFromExcel: (file: File) => Promise<ImportResult>;
  getStatistics: () => PilgrimStatistics;

  resetFilters: () => void;
}

const initialFilters: PilgrimFilters = {};

const initialPagination: PaginationParams = {

  page: 1,
  limit: 10,
  sortBy: 'id',
  sortOrder: 'desc',
};


const emptyStats: PilgrimStatistics = {
  total: 0,
  arrived: 0,
  expected: 0,
  departed: 0,
  noShow: 0,
  specialNeeds: 0,
  maleCount: 0,
  femaleCount: 0,
  occupancyRate: 0,
  byNationality: {},
  byAgeGroup: {},
};

const mapStatsResponse = (payload: any): PilgrimStatistics => {
  if (!payload || typeof payload !== 'object') {
    return { ...emptyStats };
  }

  return {
    total: Number(payload.total ?? 0),
    arrived: Number(payload.arrived ?? 0),
    expected: Number(payload.expected ?? 0),
    departed: Number(payload.departed ?? 0),
    noShow: Number(payload.noShow ?? 0),
    specialNeeds: Number(payload.specialNeeds ?? 0),
    maleCount: Number(payload.maleCount ?? 0),
    femaleCount: Number(payload.femaleCount ?? 0),
    occupancyRate: Number(payload.occupancyRate ?? 0),
    byNationality: payload.byNationality ?? {},
    byAgeGroup: payload.byAgeGroup ?? {},
  };
};



const applyFilters = (pilgrims: Pilgrim[], filters: PilgrimFilters): Pilgrim[] => {
  let filtered = [...pilgrims];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((p) =>
      p.fullName.toLowerCase().includes(searchLower) ||
      p.registrationNumber.toLowerCase().includes(searchLower) ||
      p.nationalId.toLowerCase().includes(searchLower) ||
      p.phoneNumber.toLowerCase().includes(searchLower),
    );
  }

  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((p) => filters.status!.includes(p.status));
  }

  if (filters.gender) {
    filtered = filtered.filter((p) => p.gender === filters.gender);
  }

  if (filters.hasSpecialNeeds !== undefined) {
    filtered = filtered.filter((p) => p.hasSpecialNeeds === filters.hasSpecialNeeds);
  }

  if (filters.hall) {
    filtered = filtered.filter((p) => p.assignedHall === filters.hall);
  }

  if (filters.group) {
    filtered = filtered.filter((p) => p.groupId === filters.group);
  }

  if (filters.nationality) {
    filtered = filtered.filter((p) => p.nationality === filters.nationality);
  }

  if (filters.ageRange) {
    const { min, max } = filters.ageRange;
    if (min !== undefined) {
      filtered = filtered.filter((p) => p.age >= min);
    }
    if (max !== undefined) {
      filtered = filtered.filter((p) => p.age <= max);
    }
  }

  if (filters.arrivalDateRange) {
    const { start, end } = filters.arrivalDateRange;
    filtered = filtered.filter((p) => {
      if (!p.arrivalDate) return false;
      const arrival = p.arrivalDate.getTime();
      if (start && arrival < start.getTime()) return false;
      if (end && arrival > end.getTime()) return false;
      return true;
    });
  }

  return filtered;
};

const sortPilgrims = (
  pilgrims: Pilgrim[],
  sortBy?: SortableKey,
  sortOrder: 'asc' | 'desc' = 'asc',
): Pilgrim[] => {
  if (!sortBy) {
    return pilgrims;
  }

  return [...pilgrims].sort((a, b) => {
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

const buildFallbackPilgrim = (data: CreatePilgrimDto & { id?: string }): Pilgrim => ({
  id: data.id ?? `temp-${Date.now()}`,
  registrationNumber: '',
  nationalId: data.nationalId,
  passportNumber: data.passportNumber,
  firstName: data.firstName,
  lastName: data.lastName,
  fullName: `${data.firstName} ${data.lastName}`.trim(),
  birthDate: data.birthDate ?? new Date(),
  age: data.age,
  gender: data.gender,
  nationality: data.nationality,
  phoneNumber: data.phoneNumber,
  emergencyContact: undefined,
  emergencyPhone: undefined,
  hasSpecialNeeds: data.hasSpecialNeeds ?? false,
  specialNeedsType: data.specialNeedsType,
  specialNeedsNotes: data.specialNeedsNotes,
  status: 'expected',
  arrivalDate: undefined,
  departureDate: undefined,
  assignedBed: undefined,
  assignedHall: undefined,
  groupId: data.groupId,
  groupName: undefined,
  notes: data.notes,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const usePilgrimStore = create<PilgrimState>()(
  devtools((set, get) => {
    const recomputeVisiblePilgrims = (
      allPilgrims: Pilgrim[],
      serverMeta?: { total: number; totalPages: number; hasNext?: boolean; hasPrevious?: boolean }
    ): PaginatedResponse<Pilgrim> => {
      const { filters, pagination } = get();
      const filtered = sortPilgrims(
        applyFilters(allPilgrims, filters),
        pagination.sortBy,
        pagination.sortOrder,
      );

      let paginatedData = filtered;
      let total = filtered.length;
      let totalPages = pagination.limit > 0 ? Math.max(1, Math.ceil(total / pagination.limit)) : 1;
      let hasNext = pagination.page < totalPages;
      let hasPrevious = pagination.page > 1;

      if (serverMeta) {
        total = serverMeta.total;
        totalPages = serverMeta.totalPages || Math.max(1, Math.ceil(total / Math.max(pagination.limit, 1)));
        hasNext = serverMeta.hasNext ?? (pagination.page < totalPages);
        hasPrevious = serverMeta.hasPrevious ?? (pagination.page > 1);
        paginatedData = filtered;
      } else {
        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit;
        paginatedData = pagination.limit > 0 ? filtered.slice(start, end) : filtered;
        hasNext = pagination.limit > 0 ? end < filtered.length : false;
        hasPrevious = pagination.page > 1;
      }

      set({
        allPilgrims: filtered,
        pilgrims: paginatedData,
      });

      return {
        data: paginatedData,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
        hasNext,
        hasPrevious,
      };
    };

    return {
      pilgrims: [],
      allPilgrims: [],
      selectedPilgrim: null,
      filters: initialFilters,
      pagination: initialPagination,
      isLoading: false,
      error: null,

      setPilgrims: (pilgrims) => {
        recomputeVisiblePilgrims(pilgrims);
      },

      setSelectedPilgrim: (pilgrim) => set({ selectedPilgrim: pilgrim }),

      setFilters: (filters) => {
        set({ filters, pagination: { ...get().pagination, page: 1 } });
        const current = get().allPilgrims;
        if (current.length > 0) {
          recomputeVisiblePilgrims(current);
        }
      },

      setPagination: (pagination) => {
        set({ pagination: { ...get().pagination, ...pagination } });
        const current = get().allPilgrims;
        if (current.length > 0) {
          recomputeVisiblePilgrims(current);
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      fetchPilgrims: async () => {
        set({ isLoading: true, error: null });
        try {
          const { pagination } = get();
          const queryParams = {
            page: Math.max(pagination.page - 1, 0),
            size: pagination.limit,
            sortBy: pagination.sortBy ?? 'id',
            sortDirection: ((pagination.sortOrder ?? 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC',
          };

          const [pageResponse, statsResponse] = await Promise.all([
            pilgrimAPI.getAll(queryParams),
            pilgrimAPI.getStats().catch(() => null),
          ]);

          const backendContent = Array.isArray(pageResponse?.content)
            ? pageResponse.content
            : Array.isArray(pageResponse)
              ? pageResponse
              : [];

          const transformed = transformPilgrimsFromBackend(backendContent);
          const serverMeta = {
            total: Number(pageResponse?.totalElements ?? transformed.length),
            totalPages: Number(pageResponse?.totalPages ?? Math.max(1, Math.ceil(transformed.length / Math.max(pagination.limit, 1)))),
            hasNext: typeof pageResponse?.last === 'boolean' ? !pageResponse.last : undefined,
            hasPrevious: typeof pageResponse?.first === 'boolean' ? !pageResponse.first : undefined,
          };

          const result = recomputeVisiblePilgrims(transformed, serverMeta);

          if (statsResponse) {
            set({ stats: mapStatsResponse(statsResponse) });
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          console.error('Failed to load pilgrims:', error);
          set({ error: 'errors.failedToLoadData', isLoading: false });
          throw error;
        }
      },

      fetchPilgrimById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await pilgrimAPI.getById(parseInt(id, 10));
          const pilgrim = response ? transformPilgrimFromBackend(response) : null;
          set({ selectedPilgrim: pilgrim, isLoading: false });
          return pilgrim;
        } catch (error) {
          console.error('Failed to fetch pilgrim:', error);
          const fallback = get().allPilgrims.find((p) => p.id === id) || null;
          set({ selectedPilgrim: fallback, isLoading: false });
          return fallback;
        }
      },

      createPilgrim: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await pilgrimAPI.create(data);
          await get().fetchPilgrims();
          const created = get().allPilgrims.find(
            (p) =>
              p.nationalId === data.nationalId ||
              (data.passportNumber && p.passportNumber === data.passportNumber),
          );
          set({ isLoading: false });
          return created ?? buildFallbackPilgrim(data);
        } catch (error) {
          console.error('Failed to create pilgrim:', error);
          set({ error: 'errors.failedToAddPilgrim', isLoading: false });
          throw error;
        }
      },

      updatePilgrim: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          await pilgrimAPI.update(parseInt(id, 10), data);
          await get().fetchPilgrims();
          const updated = get().allPilgrims.find((p) => p.id === id) || null;
          set({ isLoading: false });
          return (
            updated ??
            buildFallbackPilgrim({
              ...data,
              id,
              nationalId: data.nationalId ?? '',
              firstName: data.firstName ?? '',
              lastName: data.lastName ?? '',
              phoneNumber: data.phoneNumber ?? '',
              nationality: data.nationality ?? '',
              age: data.age ?? 0,
              gender: data.gender ?? 'male',
            })
          );
        } catch (error) {
          console.error('Failed to update pilgrim:', error);
          set({ error: 'errors.failedToUpdatePilgrim', isLoading: false });
          throw error;
        }
      },

      deletePilgrim: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await pilgrimAPI.delete(parseInt(id, 10));
          await get().fetchPilgrims();
          set({ isLoading: false });
          // Refresh the list
          await get().fetchPilgrims();
          return true;
        } catch (error) {
          console.error('Failed to delete pilgrim:', error);
          set({ error: 'errors.failedToDeletePilgrim', isLoading: false });
          return false;
        }
      },

      markArrival: async (id, arrivalDate) =>
        get().updatePilgrim(id, {
          status: 'arrived',
          arrivalDate,
        }),

      assignBed: async (pilgrimId, hallId, bedId) => {
        const allPilgrims = [...get().allPilgrims];
        const index = allPilgrims.findIndex((p) => p.id === pilgrimId);
        if (index === -1) {
          throw new Error('errors.pilgrimNotFound');
        }

        const updated: Pilgrim = {
          ...allPilgrims[index],
          assignedHall: hallId,
          assignedBed: bedId,
          status: 'arrived',
          arrivalDate: new Date(),
          updatedAt: new Date(),
        };

        allPilgrims[index] = updated;
        recomputeVisiblePilgrims(allPilgrims);
        return updated;
      },

      importFromExcel: async (file) => {
        set({ isLoading: true, error: null });
        try {
          const ExcelJS = require('exceljs');
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await file.arrayBuffer());
          const worksheet = workbook.getWorksheet(1);

          const errors: any[] = [];
          const duplicates: string[] = [];
          let importedCount = 0;
          const totalRecords = Math.max(worksheet.rowCount - 1, 0);
          const existingPilgrims = get().allPilgrims;

          for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
            const row = worksheet.getRow(rowIndex);
            let hasError = false;

            const nationalId = row.getCell(1).value?.toString() || '';
            const passportNumber = row.getCell(2).value?.toString() || undefined;
            const firstName = row.getCell(3).value?.toString() || '';
            const lastName = row.getCell(4).value?.toString() || '';
            const age = parseInt(row.getCell(5).value?.toString() || '0', 10);
            const genderText = row.getCell(6).value?.toString() || '';
            const nationality = row.getCell(7).value?.toString() || '';
            const phoneNumber = row.getCell(8).value?.toString() || '';
            const specialNeedsTypeText = row.getCell(9).value?.toString() || '';
            const notes = row.getCell(10).value?.toString() || undefined;

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

            let gender: 'male' | 'female' | undefined;
            if (genderText.toLowerCase() === 'male') {
              gender = 'male';
            } else if (genderText.toLowerCase() === 'female') {
              gender = 'female';
            } else {
              errors.push({ row: rowIndex, field: 'gender', value: genderText, message: 'errors.validation.invalidGender' });
              hasError = true;
            }

            let hasSpecialNeeds = false;
            let specialNeedsType: any = null;
            if (specialNeedsTypeText) {
              hasSpecialNeeds = true;
              const specialNeedsMap: Record<string, any> = {
                mobility: 'mobility',
                wheelchair: 'mobility',
                vision_hearing: 'vision_hearing',
                vision: 'vision_hearing',
                hearing: 'vision_hearing',
                medical_care: 'medical_care',
                medical: 'medical_care',
                elderly_cognitive: 'elderly_cognitive',
                elderly: 'elderly_cognitive',
                dietary_language: 'dietary_language',
                dietary: 'dietary_language',
                other: 'other',
              };
              specialNeedsType = specialNeedsMap[specialNeedsTypeText.toLowerCase()] || 'other';
            }

            if (existingPilgrims.some((p) => p.nationalId === nationalId)) {
              duplicates.push(nationalId);
              hasError = true;
            }

            if (!hasError && gender) {
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
                notes,
              };

              await pilgrimAPI.create(newPilgrim);
              importedCount++;
            }
          }

          await get().fetchPilgrims();
          set({ isLoading: false });
          return {
            success: errors.length === 0,
            totalRecords,
            importedCount,
            failedCount: totalRecords - importedCount,
            errors,
            duplicates,
          };
        } catch (error) {
          console.error('Failed to import pilgrims:', error);
          set({ error: 'errors.failedToImportFile', isLoading: false });
          throw error;
        }
      },

      getStatistics: () => get().stats,

      resetFilters: () => {
        set({ filters: initialFilters, pagination: initialPagination });
        const current = get().allPilgrims;
        if (current.length > 0) {
          recomputeVisiblePilgrims(current);
        }
      },
    };
  }, { name: 'pilgrim-store' }),
);





