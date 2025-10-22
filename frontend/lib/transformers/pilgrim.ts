import { Pilgrim, PilgrimStatus, Gender } from '@/types/pilgrim';

// Backend data structure
interface BackendPilgrim {
  id: number;
  registration_number?: string;
  national_id?: string;
  passport_number?: string;
  nationality?: string;
  date_of_birth?: string;
  gender?: string; // M or F
  status?: string; // Registered, Booked, Arrived, Departed, Cancelled
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
  user?: {
    id: number;
    name: string;
    email: string;
    Phone: string;  // Capital P as per backend
    role: string;
  };
}

// Transform backend status to frontend status
function mapStatus(backendStatus?: string): PilgrimStatus {
  const statusMap: Record<string, PilgrimStatus> = {
    'Registered': 'expected',
    'Booked': 'expected',
    'Arrived': 'arrived',
    'Departed': 'departed',
    'Cancelled': 'no_show',
  };
  return statusMap[backendStatus || 'Registered'] || 'expected';
}

// Transform backend gender to frontend gender
function mapGender(backendGender?: string): Gender {
  return backendGender === 'F' ? 'female' : 'male';
}

// Split full name into first and last name
function splitName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

// Calculate age from birth date
function calculateAge(birthDate?: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Transform backend pilgrim data to frontend format
export function transformPilgrimFromBackend(beData: BackendPilgrim): Pilgrim {
  const { firstName, lastName } = splitName(beData.user?.name);
  const fullName = beData.user?.name || '';

  return {
    id: beData.id?.toString() || '',
    registrationNumber: beData.registration_number || '',
    nationalId: beData.national_id || beData.passport_number || '',
    passportNumber: beData.passport_number,
    firstName,
    lastName,
    fullName,
    birthDate: beData.date_of_birth ? new Date(beData.date_of_birth) : new Date(),
    age: calculateAge(beData.date_of_birth),
    gender: mapGender(beData.gender),
    nationality: beData.nationality || '',
    phoneNumber: beData.user?.Phone || '',
    hasSpecialNeeds: false,
    status: mapStatus(beData.status),
    assignedBed: beData.booking?.bed?.id?.toString(),
    assignedHall: beData.booking?.bed?.tent?.code || beData.booking?.bed?.tent?.id?.toString(),
    groupId: beData.agency?.id?.toString(),
    groupName: beData.agency?.name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Transform frontend data to backend format for creating/updating
export function transformPilgrimToBackend(feData: Partial<Pilgrim>) {
  // Combine first and last name
  const name = feData.firstName && feData.lastName
    ? `${feData.firstName} ${feData.lastName}`.trim()
    : feData.fullName || '';

  // Map gender
  const gender = feData.gender === 'female' ? 'F' : 'M';

  // Format date
  const dateOfBirth = feData.birthDate instanceof Date
    ? feData.birthDate.toISOString().split('T')[0]
    : feData.birthDate;

  // Ensure phone has country code format
  let phone = feData.phoneNumber || '';
  if (phone && !phone.startsWith('+')) {
    phone = '+966' + phone.replace(/^0+/, ''); // Default to Saudi Arabia country code
  }
  if (!phone) {
    phone = '+966500000000'; // Default valid phone number
  }

  // Ensure passport number is 8 digits
  let passportNumber = (feData.passportNumber || feData.nationalId || '').replace(/\D/g, '');
  if (passportNumber.length < 8) {
    passportNumber = passportNumber.padStart(8, '0');
  } else if (passportNumber.length > 8) {
    passportNumber = passportNumber.substring(0, 8);
  }

  // Ensure nationality is 2 characters (ISO country code)
  let nationality = feData.nationality || '';
  nationality = nationality.trim().toUpperCase();
  if (nationality.length !== 2 || !/^[A-Z]{2}$/.test(nationality)) {
    nationality = 'SA'; // Default to Saudi Arabia
  }

  // Ensure dateOfBirth is provided and in the past
  let finalDateOfBirth = dateOfBirth;
  if (!finalDateOfBirth) {
    // Default to 30 years ago
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    finalDateOfBirth = thirtyYearsAgo.toISOString().split('T')[0];
  }

  return {
    name,
    email: `${feData.nationalId || feData.passportNumber}@temp.com`, // Temporary email if not provided
    phone,
    password: 'TempPass123!', // Default password for new users
    passportNumber,
    nationality,
    dateOfBirth: finalDateOfBirth,
    gender,
  };
}

// Transform array of backend pilgrims
export function transformPilgrimsFromBackend(bePilgrims: BackendPilgrim[]): Pilgrim[] {
  return bePilgrims.map(transformPilgrimFromBackend);
}