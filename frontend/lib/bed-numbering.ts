import { HallType, BedNumberingConfig, DEFAULT_NUMBERING_CONFIG } from '@/types/hall';

export function generateBedNumbers(
  hallCode: string,
  hallType: HallType,
  capacity: number,
  config?: BedNumberingConfig
): string[] {
  const numberingConfig = config || DEFAULT_NUMBERING_CONFIG[hallType];
  const bedNumbers: string[] = [];
  
  for (let i = 0; i < capacity; i++) {
    const bedNumber = generateSingleBedNumber(hallCode, i, numberingConfig);
    bedNumbers.push(bedNumber);
  }
  
  return bedNumbers;
}

export function generateSingleBedNumber(
  hallCode: string,
  index: number,
  config: BedNumberingConfig
): string {
  const num = config.startNumber + index;
  const paddedNum = config.padding > 0 
    ? num.toString().padStart(config.padding, '0')
    : num.toString();
  
  let bedNumber = '';
  
  if (config.prefix) {
    bedNumber += config.prefix;
  }
  
  bedNumber += hallCode;
  bedNumber += config.separator;
  bedNumber += paddedNum;
  
  if (config.suffix) {
    bedNumber += config.suffix;
  }
  
  return bedNumber;
}

export function parseBedNumber(bedNumber: string): {
  hallCode: string;
  number: number;
  prefix?: string;
  suffix?: string;
} | null {
  // Try common patterns
  const patterns = [
    // Standard male pattern: A-100
    /^([A-Z])-(\d+)$/,
    // Female pattern with prefix: نE-001
    /^(.+?)([A-Z])-(\d+)$/,
    // Pattern with suffix: A-100-س
    /^([A-Z])-(\d+)-(.+)$/,
    // Full pattern: prefixA-100suffix
    /^(.+?)([A-Z])-(\d+)(.+)$/,
  ];
  
  for (const pattern of patterns) {
    const match = bedNumber.match(pattern);
    if (match) {
      if (match.length === 3) {
        // Simple pattern: A-100
        return {
          hallCode: match[1],
          number: parseInt(match[2], 10),
        };
      } else if (match.length === 4) {
        if (pattern.source.includes('^(.+?)')) {
          // Prefix pattern: نE-001
          return {
            hallCode: match[2],
            number: parseInt(match[3], 10),
            prefix: match[1],
          };
        } else {
          // Suffix pattern: A-100-س
          return {
            hallCode: match[1],
            number: parseInt(match[2], 10),
            suffix: match[3],
          };
        }
      } else if (match.length === 5) {
        // Full pattern: prefixA-100suffix
        return {
          hallCode: match[2],
          number: parseInt(match[3], 10),
          prefix: match[1],
          suffix: match[4],
        };
      }
    }
  }
  
  return null;
}

export function validateBedNumberFormat(
  bedNumber: string,
  hallType: HallType,
  hallCode: string
): { valid: boolean; error?: string } {
  const parsed = parseBedNumber(bedNumber);
  
  if (!parsed) {
    return {
      valid: false,
      error: 'تنسيق رقم السرير غير صحيح',
    };
  }
  
  if (parsed.hallCode !== hallCode) {
    return {
      valid: false,
      error: `رقم السرير يجب أن يحتوي على رمز القاعة ${hallCode}`,
    };
  }
  
  if (parsed.number < 1) {
    return {
      valid: false,
      error: 'رقم السرير يجب أن يكون أكبر من صفر',
    };
  }
  
  return { valid: true };
}

export function getNextAvailableBedNumber(
  existingNumbers: string[],
  hallCode: string,
  hallType: HallType,
  config?: BedNumberingConfig
): string {
  const numberingConfig = config || DEFAULT_NUMBERING_CONFIG[hallType];
  let nextIndex = 0;
  
  // Extract all existing numbers
  const usedNumbers = existingNumbers
    .map(bn => parseBedNumber(bn))
    .filter(parsed => parsed && parsed.hallCode === hallCode)
    .map(parsed => parsed!.number);
  
  // Find the next available number
  while (usedNumbers.includes(numberingConfig.startNumber + nextIndex)) {
    nextIndex++;
  }
  
  return generateSingleBedNumber(hallCode, nextIndex, numberingConfig);
}

export function sortBedNumbers(bedNumbers: string[]): string[] {
  return bedNumbers.sort((a, b) => {
    const parsedA = parseBedNumber(a);
    const parsedB = parseBedNumber(b);
    
    if (!parsedA || !parsedB) return 0;
    
    // First sort by hall code
    if (parsedA.hallCode !== parsedB.hallCode) {
      return parsedA.hallCode.localeCompare(parsedB.hallCode);
    }
    
    // Then by number
    return parsedA.number - parsedB.number;
  });
}

export function getBedNumberingPreview(
  hallCode: string,
  hallType: HallType,
  config: BedNumberingConfig,
  count: number = 5
): string[] {
  const preview: string[] = [];
  
  for (let i = 0; i < count; i++) {
    preview.push(generateSingleBedNumber(hallCode, i, config));
  }
  
  return preview;
}