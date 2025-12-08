import { Hall, Bed, HallType } from '@/types/hall';
import { BedStatus } from '@/types/pilgrim';

// Backend Tent data structure
interface BackendTent {
  id: number;
  location: string;
  capacity: number;
  name?: string;
  code?: string;
  type?: string; // male, female
  agency?: {
    id: number;
    name: string;
  };
  beds?: BackendBed[];
  created_at?: string;
  updated_at?: string;
}

// Backend Bed data structure
interface BackendBed {
  id: number;
  status: string; // Available, Booked, Checked_in, Checked_out
  number?: string;
  hallCode?: string;
  hallId?: string;
  pilgrimId?: number | string;
  pilgrimName?: string;
  tent?: BackendTent;
  booking?: {
    id: number;
    status: string;
    pilgrim?: {
      id: number;
      firstName?: string;
      lastName?: string;
      passport_number: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

// Map backend bed status to frontend format
function mapBedStatus(beStatus?: string): BedStatus {
  // Backend (BedDTOOut) already converts to lowercase: vacant, occupied, reserved, maintenance
  // Just validate and return as-is
  const status = beStatus?.toLowerCase() || 'vacant';
  const validStatuses: BedStatus[] = ['vacant', 'occupied', 'reserved', 'maintenance'];
  return validStatuses.includes(status as BedStatus) ? (status as BedStatus) : 'vacant';
}

// Map frontend bed status to backend format
export function mapBedStatusToBackend(feStatus: BedStatus): string {
  const statusMap: Record<BedStatus, string> = {
    'vacant': 'Available',
    'occupied': 'Booked',
    'reserved': 'Reserved',
    'maintenance': 'Maintenance',
  };
  return statusMap[feStatus] || 'Available';
}

// Transform backend bed to frontend format
function transformBedFromBackend(beData: BackendBed): Bed {
  // Use hallCode from the new backend format (BedDTOOut), fallback to nested tent data
  const hallCode = beData.hallCode || beData.tent?.code || beData.tent?.id?.toString() || '';
  
  // Use pilgrimName from the new backend format (BedDTOOut), fallback to nested booking pilgrim
  let pilgrimName: string | undefined;
  if (beData.pilgrimName && beData.pilgrimName !== 'None') {
    pilgrimName = beData.pilgrimName;
  }
  
  return {
    id: beData.id?.toString() || '',
    number: beData.number || beData.id?.toString() || '', // Use the number from backend if available
    hallId: beData.hallId || beData.tent?.id?.toString() || '',
    hallCode: hallCode,
    status: mapBedStatus(beData.status),
    pilgrimId: (beData.pilgrimId || beData.booking?.pilgrim?.id)?.toString(),
    pilgrimName: pilgrimName,
    isSpecialNeeds: false,
    lastAssignedAt: beData.booking ? new Date(beData.created_at || '') : undefined,
  };
}

// Transform backend tent data to frontend hall format
export function transformHallFromBackend(beData: BackendTent): Hall {
  const beds = (beData.beds?.map(transformBedFromBackend) || [])
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));
  const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
  const availableBeds = beds.filter(bed => bed.status === 'vacant').length;
  const specialNeedsBeds = beds.filter(bed => bed.isSpecialNeeds && bed.status === 'occupied').length;

  return {
    id: beData.id?.toString() || '',
    name: beData.name || beData.location || `Hall ${beData.id}`,
    code: beData.code || `H${beData.id}`,
    type: (beData.type === 'female' ? 'female' : 'male') as HallType,
    capacity: beData.capacity || 0,
    currentOccupancy: occupiedBeds,
    availableBeds: availableBeds,
    specialNeedsOccupancy: specialNeedsBeds,
    beds: beds,
    numberingFormat: 'standard',
    createdAt: beData.created_at ? new Date(beData.created_at) : new Date(),
    updatedAt: beData.updated_at ? new Date(beData.updated_at) : new Date(),
  };
}

// Transform frontend hall data to backend tent format for creating/updating
export function transformHallToBackend(feData: Partial<Hall>) {
  return {
    location: feData.name || '',
    capacity: feData.capacity || 0,
    name: feData.name,
    code: feData.code,
    type: feData.type, // male or female
  };
}

// Transform array of backend tents to frontend halls
export function transformHallsFromBackend(beTents: BackendTent[]): Hall[] {
  return beTents.map(transformHallFromBackend);
}

// Transform bed assignment data for backend
export function transformBedAssignmentToBackend(pilgrimId: string, bedId: string) {
  return {
    pilgrimId: parseInt(pilgrimId, 10),
    bedId: parseInt(bedId, 10),
  };
}