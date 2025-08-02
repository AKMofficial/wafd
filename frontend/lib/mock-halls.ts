import { Hall, Bed, HallType, DEFAULT_NUMBERING_CONFIG } from '@/types/hall';
import { generateMockPilgrims } from './mock-data';

const hallNames = {
  male: [
    { name: 'قاعة الصفا', code: 'A' },
    { name: 'قاعة المروة', code: 'B' },
    { name: 'قاعة الكعبة', code: 'C' },
    { name: 'قاعة زمزم', code: 'D' },
  ],
  female: [
    { name: 'قاعة فاطمة', code: 'E' },
    { name: 'قاعة عائشة', code: 'F' },
    { name: 'قاعة خديجة', code: 'G' },
    { name: 'قاعة مريم', code: 'H' },
  ],
};

export function generateMockHalls(): Hall[] {
  const halls: Hall[] = [];
  const pilgrims = generateMockPilgrims(150);
  
  // Generate male halls
  hallNames.male.forEach((hallInfo, index) => {
    const capacity = 50;
    const beds: Bed[] = [];
    const config = DEFAULT_NUMBERING_CONFIG.male;
    
    for (let i = 0; i < capacity; i++) {
      const bedNumber = `${hallInfo.code}${config.separator}${config.startNumber + i}`;
      beds.push({
        id: `${hallInfo.code}-bed-${i + 1}`,
        number: bedNumber,
        hallId: (index + 1).toString(),
        hallCode: hallInfo.code,
        status: 'vacant',
        isSpecialNeeds: false,
      });
    }
    
    halls.push({
      id: (index + 1).toString(),
      name: hallInfo.name,
      code: hallInfo.code,
      type: 'male' as HallType,
      capacity,
      currentOccupancy: 0,
      availableBeds: capacity,
      specialNeedsOccupancy: 0,
      beds,
      numberingFormat: 'standard',
      numberingConfig: config,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-25'),
    });
  });
  
  // Generate female halls
  hallNames.female.forEach((hallInfo, index) => {
    const capacity = 40;
    const beds: Bed[] = [];
    const config = {
      ...DEFAULT_NUMBERING_CONFIG.female,
      prefix: 'ن', // ن for نساء
    };
    
    for (let i = 0; i < capacity; i++) {
      const num = config.startNumber + i;
      const paddedNum = num.toString().padStart(config.padding, '0');
      const bedNumber = `${config.prefix}${hallInfo.code}${config.separator}${paddedNum}`;
      
      beds.push({
        id: `${hallInfo.code}-bed-${i + 1}`,
        number: bedNumber,
        hallId: (index + 5).toString(),
        hallCode: hallInfo.code,
        status: 'vacant',
        isSpecialNeeds: false,
      });
    }
    
    halls.push({
      id: (index + 5).toString(),
      name: hallInfo.name,
      code: hallInfo.code,
      type: 'female' as HallType,
      capacity,
      currentOccupancy: 0,
      availableBeds: capacity,
      specialNeedsOccupancy: 0,
      beds,
      numberingFormat: 'custom',
      numberingConfig: config,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-25'),
    });
  });
  
  // Assign pilgrims to beds based on their existing hall and bed assignments
  pilgrims.forEach(pilgrim => {
    if (pilgrim.assignedHall && pilgrim.assignedBed && pilgrim.status === 'arrived') {
      // Try to find matching hall
      let matchingHall: Hall | undefined;
      
      // Check by hall name first
      matchingHall = halls.find(h => h.name === pilgrim.assignedHall);
      
      // If not found by name, assign to appropriate gender hall
      if (!matchingHall) {
        const availableHalls = halls.filter(h => 
          h.type === pilgrim.gender && 
          h.availableBeds > 0
        );
        matchingHall = availableHalls[0];
      }
      
      if (matchingHall) {
        // Find first available bed
        const availableBed = matchingHall.beds.find(b => b.status === 'vacant');
        if (availableBed) {
          availableBed.status = 'occupied';
          availableBed.pilgrimId = pilgrim.id;
          availableBed.lastAssignedAt = pilgrim.arrivalDate;
          
          if (pilgrim.hasSpecialNeeds) {
            availableBed.isSpecialNeeds = true;
            matchingHall.specialNeedsOccupancy++;
          }
          
          matchingHall.currentOccupancy++;
          matchingHall.availableBeds--;
        }
      }
    }
  });
  
  // Add some reserved and maintenance beds for realism
  halls.forEach(hall => {
    // Reserve 2-3 beds per hall
    const bedsToReserve = Math.floor(Math.random() * 2) + 1;
    let reserved = 0;
    
    hall.beds.forEach(bed => {
      if (bed.status === 'vacant' && reserved < bedsToReserve) {
        bed.status = 'reserved';
        hall.availableBeds--;
        reserved++;
      }
    });
    
    // Put 1 bed in maintenance in some halls
    if (Math.random() > 0.5) {
      const vacantBed = hall.beds.find(b => b.status === 'vacant');
      if (vacantBed) {
        vacantBed.status = 'maintenance';
        vacantBed.maintenanceNotes = 'صيانة دورية';
        hall.availableBeds--;
      }
    }
  });
  
  return halls;
}

export function getHallSummaryStats(halls: Hall[]) {
  const totalBeds = halls.reduce((sum, h) => sum + h.capacity, 0);
  const occupiedBeds = halls.reduce((sum, h) => sum + h.currentOccupancy, 0);
  const availableBeds = halls.reduce((sum, h) => sum + h.availableBeds, 0);
  
  const maleHalls = halls.filter(h => h.type === 'male');
  const femaleHalls = halls.filter(h => h.type === 'female');
  
  return {
    total: {
      halls: halls.length,
      beds: totalBeds,
      occupied: occupiedBeds,
      available: availableBeds,
      occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
    },
    male: {
      halls: maleHalls.length,
      beds: maleHalls.reduce((sum, h) => sum + h.capacity, 0),
      occupied: maleHalls.reduce((sum, h) => sum + h.currentOccupancy, 0),
      available: maleHalls.reduce((sum, h) => sum + h.availableBeds, 0),
    },
    female: {
      halls: femaleHalls.length,
      beds: femaleHalls.reduce((sum, h) => sum + h.capacity, 0),
      occupied: femaleHalls.reduce((sum, h) => sum + h.currentOccupancy, 0),
      available: femaleHalls.reduce((sum, h) => sum + h.availableBeds, 0),
    },
  };
}