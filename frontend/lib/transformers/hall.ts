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
  tent?: BackendTent;
  booking?: {
    id: number;
    status: string;
    pilgrim?: {
      id: number;
      passport_number: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

// Map backend bed status to frontend format
function mapBedStatus(beStatus?: string): BedStatus {
  const statusMap: Record<string, BedStatus> = {
    'Available': 'vacant',
    'Booked': 'occupied',
    'Reserved': 'reserved',
    'Checked_in': 'occupied',
    'Checked_out': 'vacant',
  };
  return statusMap[beStatus || 'Available'] || 'vacant';
}

// Transform backend bed to frontend format
function transformBedFromBackend(beData: BackendBed): Bed {
  return {
    id: beData.id?.toString() || '',
    number: beData.id?.toString() || '', // Use ID as number for now
    hallId: beData.tent?.id?.toString() || '',
    hallCode: beData.tent?.code || beData.tent?.id?.toString() || '',
    status: mapBedStatus(beData.status),
    pilgrimId: beData.booking?.pilgrim?.id?.toString(),
    isSpecialNeeds: false,
    lastAssignedAt: beData.booking ? new Date(beData.created_at || '') : undefined,
  };
}

// Transform backend tent data to frontend hall format
export function transformHallFromBackend(beData: BackendTent): Hall {
  const beds = beData.beds?.map(transformBedFromBackend) || [];
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