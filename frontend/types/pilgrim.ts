export type Gender = 'male' | 'female';
export type SpecialNeedsType = 'wheelchair' | 'visual' | 'hearing' | 'mobility' | 'other' | null;
export type PilgrimStatus = 'expected' | 'arrived' | 'departed' | 'no_show';
export type BedStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance';

export interface Pilgrim {
  id: string;
  registrationNumber: string;
  nationalId: string;
  passportNumber?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: Date;
  age: number;
  gender: Gender;
  nationality: string;
  phoneNumber: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  hasSpecialNeeds: boolean;
  specialNeedsType?: SpecialNeedsType;
  specialNeedsNotes?: string;
  status: PilgrimStatus;
  arrivalDate?: Date;
  departureDate?: Date;
  assignedBed?: string;
  assignedHall?: string;
  groupId?: string;
  groupName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PilgrimGroup {
  id: string;
  name: string;
  leaderName: string;
  leaderPhone: string;
  country: string;
  totalMembers: number;
  arrivalDate: Date;
  departureDate: Date;
  notes?: string;
}

export interface BedAssignment {
  id: string;
  pilgrimId: string;
  hallId: string;
  bedNumber: string;
  assignedAt: Date;
  assignedBy: string;
  status: BedStatus;
  previousBed?: string;
  transferReason?: string;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedCount: number;
  failedCount: number;
  errors: ImportError[];
  duplicates: string[];
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface PilgrimFilters {
  search?: string;
  status?: PilgrimStatus[];
  gender?: Gender;
  hasSpecialNeeds?: boolean;
  hall?: string;
  group?: string;
  nationality?: string;
  ageRange?: {
    min?: number;
    max?: number;
  };
  arrivalDateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: keyof Pilgrim;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PilgrimStatistics {
  total: number;
  arrived: number;
  expected: number;
  departed: number;
  noShow: number;
  specialNeeds: number;
  maleCount: number;
  femaleCount: number;
  occupancyRate: number;
  byNationality: Record<string, number>;
  byAgeGroup: Record<string, number>;
}

export interface CreatePilgrimDto {
  registrationNumber: string;
  nationalId: string;
  passportNumber?: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: Gender;
  nationality: string;
  phoneNumber: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  hasSpecialNeeds?: boolean;
  specialNeedsType?: SpecialNeedsType;
  specialNeedsNotes?: string;
  groupId?: string;
  notes?: string;
}

export interface UpdatePilgrimDto extends Partial<CreatePilgrimDto> {
  status?: PilgrimStatus;
  arrivalDate?: Date;
  departureDate?: Date;
}

export interface ExcelImportColumn {
  header: string;
  field: keyof CreatePilgrimDto;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'gender' | 'boolean';
  transform?: (value: any) => any;
}

export const EXCEL_IMPORT_COLUMNS: ExcelImportColumn[] = [
  { header: 'رقم التسجيل', field: 'registrationNumber', required: true, type: 'string' },
  { header: 'رقم الهوية', field: 'nationalId', required: true, type: 'string' },
  { header: 'رقم الجواز', field: 'passportNumber', required: false, type: 'string' },
  { header: 'الاسم الأول', field: 'firstName', required: true, type: 'string' },
  { header: 'الاسم الأخير', field: 'lastName', required: true, type: 'string' },
  { header: 'تاريخ الميلاد', field: 'birthDate', required: true, type: 'date' },
  { header: 'الجنس', field: 'gender', required: true, type: 'gender' },
  { header: 'الجنسية', field: 'nationality', required: true, type: 'string' },
  { header: 'رقم الهاتف', field: 'phoneNumber', required: true, type: 'string' },
  { header: 'جهة اتصال الطوارئ', field: 'emergencyContact', required: false, type: 'string' },
  { header: 'هاتف الطوارئ', field: 'emergencyPhone', required: false, type: 'string' },
  { header: 'احتياجات خاصة', field: 'hasSpecialNeeds', required: false, type: 'boolean' },
  { header: 'ملاحظات', field: 'notes', required: false, type: 'string' },
];