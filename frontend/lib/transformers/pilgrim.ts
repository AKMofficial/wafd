import { Pilgrim, PilgrimStatus, Gender, SpecialNeedsType } from '@/types/pilgrim';

interface BackendPilgrim {
  id: number;
  registrationNumber?: string;
  nationalId?: string;
  passportNumber?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  phoneNumber?: string;
  status?: string;
  hasSpecialNeeds?: boolean;
  specialNeedsType?: string;
  specialNeedsNotes?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  groupId?: number;
  groupName?: string;
  assignedBed?: string | number;
  assignedHall?: string;
  agencyId?: number;
  agencyName?: string;
  agency?: {
    id: number;
    name: string;
    licenseNumber: string;
    country: string;
  };
  booking?: {
    id: number;
    status: string;
    bed?: {
      id: number;
      status: string;
      tent?: {
        id: number;
        location: string;
        name?: string;
        code?: string;
      };
    };
  };
}

function mapStatus(status?: string): PilgrimStatus {
  if (!status) return 'expected';
  switch (status.toLowerCase()) {
    case 'arrived':
      return 'arrived';
    case 'departed':
      return 'departed';
    case 'no_show':
    case 'no-show':
    case 'cancelled':
      return 'no_show';
    default:
      return 'expected';
  }
}

function mapGender(gender?: string): Gender {
  if (!gender) return 'male';
  const value = gender.toLowerCase();
  if (value === 'female' || value === 'f') {
    return 'female';
  }
  return 'male';
}

function deriveNames(firstName?: string, lastName?: string, fullName?: string) {
  if (firstName || lastName) {
    return {
      firstName: firstName || '',
      lastName: lastName || '',
      fullName: `${firstName || ''} ${lastName || ''}`.trim(),
    };
  }

  if (fullName) {
    const parts = fullName.trim().split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      fullName,
    };
  }

  return { firstName: '', lastName: '', fullName: '' };
}

// Transform backend pilgrim data to frontend format
export function transformPilgrimFromBackend(beData: BackendPilgrim): Pilgrim {
  const names = deriveNames(beData.firstName, beData.lastName, beData.fullName);
  const createdAt = beData.createdAt ? new Date(beData.createdAt) : new Date();
  const updatedAt = beData.updatedAt ? new Date(beData.updatedAt) : createdAt;

  // Handle both flat and nested bed/hall data from backend
  let assignedBed: string | undefined;
  let assignedHall: string | undefined;
  
  // Check for flat fields first (from new backend)
  if (beData.assignedBed) {
    assignedBed = beData.assignedBed?.toString();
  }
  if (beData.assignedHall) {
    assignedHall = beData.assignedHall;
  }
  
  // Fall back to nested booking data (for backwards compatibility)
  if (!assignedBed && beData.booking?.bed?.id) {
    assignedBed = beData.booking.bed.id.toString();
  }
  if (!assignedHall && beData.booking?.bed?.tent?.code) {
    assignedHall = beData.booking.bed.tent.code;
  }
  if (!assignedHall && beData.booking?.bed?.tent?.id) {
    assignedHall = beData.booking.bed.tent.id.toString();
  }

  return {
    id: beData.id?.toString() || '',
    registrationNumber: beData.registrationNumber || '',
    nationalId: beData.nationalId || beData.passportNumber || '',
    passportNumber: beData.passportNumber,
    firstName: names.firstName,
    lastName: names.lastName,
    fullName: names.fullName,
    birthDate: createdAt, // no birth date tracked; use createdAt as stable Date instance
    age: typeof beData.age === 'number' ? beData.age : 0,
    gender: mapGender(beData.gender),
    nationality: beData.nationality || '',
    phoneNumber: beData.phoneNumber || '',
    hasSpecialNeeds: Boolean(beData.hasSpecialNeeds),
    specialNeedsType: beData.specialNeedsType as SpecialNeedsType | undefined,
    specialNeedsNotes: beData.specialNeedsNotes || undefined,
    status: mapStatus(beData.status),
    assignedBed,
    assignedHall,
    groupId: (beData.groupId ?? beData.agencyId ?? beData.agency?.id)?.toString(),
    groupName: beData.groupName || beData.agencyName || beData.agency?.name,
    notes: beData.notes || undefined,
    createdAt,
    updatedAt,
  };
}

export function transformPilgrimToBackend(feData: Partial<Pilgrim>) {
  const firstName = feData.firstName || feData.fullName?.split(' ')[0] || '';
  const lastName = feData.lastName || feData.fullName?.split(' ').slice(1).join(' ') || '';
  const groupId = feData.groupId ? Number(feData.groupId) : undefined;

  return {
    nationalId: feData.nationalId,
    passportNumber: feData.passportNumber,
    firstName,
    lastName,
    age: feData.age,
    gender: feData.gender,
    nationality: feData.nationality,
    phoneNumber: feData.phoneNumber,
    hasSpecialNeeds: feData.hasSpecialNeeds,
    specialNeedsType: feData.specialNeedsType,
    specialNeedsNotes: feData.specialNeedsNotes,
    notes: feData.notes,
    status: feData.status,
    groupId,
  };
}

export function transformPilgrimsFromBackend(bePilgrims: BackendPilgrim[]): Pilgrim[] {
  return bePilgrims.map(transformPilgrimFromBackend);
}
