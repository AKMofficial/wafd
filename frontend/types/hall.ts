import { BedStatus } from './pilgrim';

export type HallType = 'male' | 'female';
export type BedNumberingFormat = 'standard' | 'custom';

export interface Hall {
  id: string;
  name: string;
  code: string;
  type: HallType;
  capacity: number;
  currentOccupancy: number;
  availableBeds: number;
  specialNeedsOccupancy: number;
  beds: Bed[];
  numberingFormat: BedNumberingFormat;
  numberingConfig?: BedNumberingConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bed {
  id: string;
  number: string;
  hallId: string;
  hallCode: string;
  status: BedStatus;
  pilgrimId?: string;
  pilgrimName?: string;
  isSpecialNeeds: boolean;
  isDoubleBed?: boolean;
  companionBedId?: string;
  lastAssignedAt?: Date;
  lastVacatedAt?: Date;
  maintenanceNotes?: string;
}

export interface BedNumberingConfig {
  prefix?: string;
  suffix?: string;
  startNumber: number;
  padding: number;
  separator: string;
}

export interface HallStatistics {
  totalHalls: number;
  totalBeds: number;
  totalOccupied: number;
  totalAvailable: number;
  totalMaintenance: number;
  totalReserved: number;
  occupancyRate: number;
  maleHalls: {
    count: number;
    beds: number;
    occupied: number;
    occupancyRate: number;
  };
  femaleHalls: {
    count: number;
    beds: number;
    occupied: number;
    occupancyRate: number;
  };
  specialNeedsOccupied: number;
  byHall: Record<string, {
    name: string;
    occupancy: number;
    capacity: number;
    rate: number;
  }>;
}

export interface CreateHallDto {
  name: string;
  code: string;
  type: HallType;
  capacity: number;
  numberingFormat?: BedNumberingFormat;
  numberingConfig?: BedNumberingConfig;
}

export interface UpdateHallDto extends Partial<CreateHallDto> {
  id: string;
}

export interface HallFilters {
  search?: string;
  type?: HallType;
  minOccupancy?: number;
  maxOccupancy?: number;
  hasAvailableBeds?: boolean;
  hasSpecialNeeds?: boolean;
}

export interface BedFilters {
  status?: BedStatus[];
  isSpecialNeeds?: boolean;
  search?: string;
}

export interface BedAssignmentDto {
  pilgrimId: string;
  bedId: string;
  isSpecialNeeds?: boolean;
  companionBedId?: string;
}

export interface BedTransferDto {
  pilgrimId: string;
  fromBedId: string;
  toBedId: string;
  reason?: string;
}

export interface HallOccupancyTrend {
  date: Date;
  hallId: string;
  occupancy: number;
  arrivals: number;
  departures: number;
}

export const DEFAULT_NUMBERING_CONFIG: Record<HallType, BedNumberingConfig> = {
  male: {
    separator: '-',
    startNumber: 100,
    padding: 0,
  },
  female: {
    prefix: '',
    separator: '-',
    startNumber: 1,
    padding: 3,
  }
};

export const HALL_CODE_PATTERN = /^[A-Z]$/;
export const MAX_HALL_CAPACITY = 200;
export const MIN_HALL_CAPACITY = 10;

export interface PaginatedHallsResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}